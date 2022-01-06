/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper, Card, CardContent, CardHeader, CardActions, Avatar, IconButton,
} from '@material-ui/core';
import {
  Save, SaveOutlined, Pageview, PageviewOutlined, DeleteSweepOutlined, CancelOutlined,
} from '@material-ui/icons';
import { BlockEditable } from 'markdown-translatable';

const useStyles = makeStyles(theme => ({
  actions: {
    textAlign: 'right',
    paddingRight: `${theme.spacing(1.5)}px`,
    width: '100%',
  },
  action: {
    marginLeft: `0px`,
  },
}));

function FileCard({
  isAuthenticated,
  repository,
  file,
}) {
  const classes = useStyles();
  const [preview, setPreview] = useState(true);
  const [markdown, setMarkdown] = useState('');
  const changed = (markdown !== (file && file.content));
  const avatarUrl = repository.avatar_url || repository.owner.avatar_url;
  const access = repository.permissions.push;

  useEffect(() => {
    setMarkdown(file && file.content ? file.content : '');
  }, [file]);

  const branch = (file && file.branch) ? file.branch : repository.default_branch;

  return (
    <Card
      data-testid="component-fileCard"
    >
      <CardHeader
        avatar={<Avatar src={avatarUrl} />}
        title={<strong>{file && file.path}</strong>}
        subheader={repository.full_name + '/' + branch}
        data-testid="cardHeader"
      />
      <CardContent>
        <Paper data-testid="BlockEditable">
          <BlockEditable
            preview={preview}
            markdown={markdown}
            onEdit={setMarkdown}
            editable={isAuthenticated}
          />
        </Paper>
      </CardContent>
      <CardActions>
        <div className={classes.actions}>
          <IconButton 
            className={classes.action}
            aria-label="Preview"
            onClick={() => setPreview(!preview)}
            data-testid="previewButton"
          >
            {
              !preview ?
                <Pageview data-testid="previewIcon"/> :
                <PageviewOutlined data-testid="previewIconOutlined"/>
            }
          </IconButton>
          <IconButton
            className={classes.action}
            aria-label="Save"
            disabled={!access || !changed}
            onClick={() => {
              if (changed) file.save(markdown);
            }}
            data-testid="saveButton"
          >
            {
              changed ? 
              <Save data-testid="saveIcon" /> : 
              <SaveOutlined data-testid="saveIconOutlined" />
            }
          </IconButton>
          <IconButton
            className={classes.action}
            aria-label="Delete"
            disabled={!access}
            onClick={() => {
              const confirmation = window.confirm(
                `Are you sure you want to Delete ${file.filepath}?`
              );

              if (confirmation) file.dangerouslyDelete();
            }}
            data-testid="deleteButton"
          >
            <DeleteSweepOutlined />
          </IconButton>
          <IconButton
            title="Close Repository"
            onClick={file.close}
            data-testid="closeButton"
          >
            <CancelOutlined />
          </IconButton>
        </div>
      </CardActions>
    </Card>
  );
};

FileCard.propTypes = {
  /** Repository tree_url can be used in place of blobConfig */
  repository: PropTypes.shape({
    owner: PropTypes.shape({
      username: PropTypes.string.isRequired,
      avatar_url: PropTypes.string.isRequired,
    }),
    name: PropTypes.string.isRequired,
    avatar_url: PropTypes.string,
    permissions: PropTypes.shape({
      push: PropTypes.bool,
    }).isRequired,
    full_name: PropTypes.string.isRequired,
    default_branch: PropTypes.string.isRequired, 
  }).isRequired,
  /** Pass a previously returned file object to bypass the selection. */
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    sha: PropTypes.string.isRequired,
    content: PropTypes.string,
    branch: PropTypes.string,
    filepath: PropTypes.string,
    save: PropTypes.func.isRequired,
    dangerouslyDelete: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired
  }),
  /** Pass a previously returned authentication object to bypass login. */
  isAuthenticated: PropTypes.bool,
};

export default FileCard;
