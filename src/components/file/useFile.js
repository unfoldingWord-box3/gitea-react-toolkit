import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useDeepCompareCallback } from 'use-deep-compare';

import {
  getContentFromFile, saveFile, ensureFile, deleteFile,
} from './helpers';
import {
  FileCard, FileForm, useBlob, RepositoryContext,
} from '..';
import {fetchCatalogContent} from './dcsCatalogNextApis';

function useFile({
  authentication,
  repository,
  filepath,
  onFilepath,
  defaultContent,
  config: _config,
  create=false,
  onOpenValidation,
  onLoadCache,
  onSaveCache,
  onConfirmClose,
  releaseFlag,
}) {
  const [file, setFile] = useState();
  const [isChanged, setIsChanged] = useState(false);
  const [blob, setBlob] = useState();

  const { actions: { updateBranch }, config: repositoryConfig } = useContext(RepositoryContext);

  const config = _config || repositoryConfig;
  const branch = repository && (repository.branch || repository.default_branch);
  const [deleted, setDeleted] = useState();

  const _setBlob = useDeepCompareCallback(async (_blob) => {
    if (blob && _blob && typeof onConfirmClose == 'function') {
      const confirm = await onConfirmClose()

      if (confirm) {
        setBlob(_blob);
      }
    } else{
      setBlob(_blob);
    }
  },[blob, setBlob, onConfirmClose]);

  const {
    state: blobState, actions: blobActions, components: blobComponents,
  } = useBlob({
    blob, onBlob: _setBlob, config, repository, filepath, releaseFlag,
  });

  const { push: writeable } = (repository && repository.permissions) ? repository.permissions : {};

  const update = useCallback((_file) => {
    setFile(_file);
  }, []);

  useEffect(() => {
    setIsChanged(false);
  }, [file, deleted, closed]);

  const read = useCallback(async (_filepath) => {
    if (onFilepath) {
      await onFilepath(_filepath);
    };
  }, [onFilepath]);

  const load = useDeepCompareCallback(async () => {
    if (config && repository && filepath) {
      const _file = await ensureFile({
        filepath, defaultContent, authentication, config, repository, branch, onOpenValidation,
      });

      console.log("ensureFile:", _file);

      let defaultCachedContentFile;
      if (onLoadCache && _file && _file.html_url) {
        defaultCachedContentFile = await onLoadCache({authentication, repository, branch, html_url: _file.html_url, file: _file});
      }
      
      // console.log("GRT defaultContent", '|', defaultContent);
      // console.log("GRT defaultCachedContent", '|', defaultCachedContentFile);

      let content;
      let _publishedContent;

      if (defaultCachedContentFile && defaultCachedContentFile.content) {
        // Load autosaved content:
        content = defaultCachedContentFile.content;
      } else {
        // Get SERVER content: Overwrite cache:
        content = await getContentFromFile(_file);

        // Check catalog next:
        const prodTag = repository.catalog?.prod?.branch_or_tag_name;
        if ( prodTag ) {
          _publishedContent = await fetchCatalogContent('unfoldingword', repository.name, prodTag, filepath, config);
        }
      }

      update({
        ..._file, branch, content, filepath: _file.path, publishedContent: _publishedContent,
      });
    }
  }, [config, repository, filepath, onLoadCache, ensureFile, update,
      defaultContent, authentication, branch, onOpenValidation
  ]);
  
  const createFile = useDeepCompareCallback(async ({
    branch: _branch, filepath: _filepath, defaultContent: _defaultContent, onOpenValidation,
  }) => {
    if (config && repository) {
      const _file = await ensureFile({
        authentication, config, repository,
        branch: _branch,
        filepath: _filepath,
        defaultContent: _defaultContent,
        onOpenValidation,
      });

      if (_file) {
        updateBranch(_branch);
        onFilepath(_filepath);
      };
    }
  }, [authentication, config, repository, updateBranch, onFilepath]);

  const close = useDeepCompareCallback(() => {
    if (blobActions && blobActions.close) {
      blobActions.close();
    };

    if (onFilepath) {
      onFilepath();
    };
    update();
  }, [update, blobActions, onFilepath]);

  const saveCache = useDeepCompareCallback(async (content) => {
    if (onSaveCache) {
      await onSaveCache({authentication, repository, branch, file, content});
    }
  }, [writeable, authentication, repository, branch, file, onSaveCache]);

  const save = useDeepCompareCallback(async (content) => {
    //console.log("GRT save // will save file");
    await saveFile({
      authentication, repository, branch, file, content,
    }).then(
      // Empty cache if user has saved this file
      // (save() will not happen for "OFFLINE" system files)
      async() => {
        await saveCache(null); 
        await load();
      }
    );
  }, [writeable, authentication, repository, branch, file, load, saveFile, saveCache]);

  const dangerouslyDelete = useDeepCompareCallback(async () => {
    if (writeable) {
      const _deleted = await deleteFile({
        authentication, repository, file, branch,
      });

      if (_deleted) {
        setDeleted(true);
      }
    };
  }, [file, authentication, branch, repository, writeable]);

  useDeepCompareEffect(() => {
    const notLoaded = (!file && filepath && !deleted);
    const loadNew = (file && filepath && file.filepath !== filepath);

    if (notLoaded || loadNew) {
      load();
    }
  }, [deleted, filepath, load, file]);

  const blobFilepath = blobState && blobState.filepath;

  useEffect(() => {
    if (blobFilepath && onFilepath) {
      onFilepath(blobFilepath);
    };
  }, [blobFilepath, onFilepath]);

  useDeepCompareEffect(() => { // if there is a file but no repository, close file.
    if (!repository && file) close();
  }, [repository, file, close]);

  useEffect(() => {
    if (deleted) {
      close();
      setDeleted(false);
    };
  }, [deleted, close]);

  const actions = {
    update,
    load,
    read,
    save,
    saveCache,
    onSaveCache,
    onLoadCache,
    close,
    dangerouslyDelete,
    setIsChanged,
    onConfirmClose,
  };

  const components = {
    create: repository && (
      <FileForm
        branch={branch}
        defaultContent={defaultContent}
        onSubmit={createFile}
      />
    ),
    browse: repository && blobComponents.browse,
    fileCard: repository && file && (
      <FileCard
        authentication={Object.keys(authentication).length === 0}
        repository={repository}
        file={{ ...file, ...actions }}
      />
    ),
  };

  let component = <></>;

  if (file) {
    component = components.fileCard;
  } else if (!filepath) {
    if (create) {
      component = components.create;
    } else {
      component = components.browse;
    }
  }

  return {
    state: file,
    stateValues: {isChanged},
    actions,
    component,
    components,
  };
};

useFile.propTypes = {
  /** The full filepath for the file. */
  filepath: PropTypes.string,
  /** Function to propogate filepath when the Blob is selected. */
  onFilepath: PropTypes.func,
  /** Authentication object returned from a successful withAuthentication login. */
  authentication: PropTypes.shape({
    config: PropTypes.shape({
      server: PropTypes.string.isRequired,
      headers: PropTypes.shape({ Authorization: PropTypes.string.isRequired }).isRequired,
    }).isRequired,
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  }),
  /** Repository tree_url can be used in place of blobConfig */
  repository: PropTypes.shape({
    owner: PropTypes.shape({ username: PropTypes.string.isRequired }),
    name: PropTypes.string.isRequired,
  }).isRequired,
  /** use a form to create a new file */
  create: PropTypes.bool,
};

export default useFile;
