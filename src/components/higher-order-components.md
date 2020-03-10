---
name: Higher Order Components
route: /hoc
---

import { useState } from 'react';
import { Playground, Props } from 'docz';
import { Paper, Card, CardContent, CardHeader, CardActions, Avatar, IconButton, Button } from '@material-ui/core';
import { Code, Save, SaveOutlined } from '@material-ui/icons';
import { withAuthentication, withRepository, withBlob, withFile } from './';
import { BlockEditable } from "markdown-translatable";

# Higher Order Components

Wrapping your components with `withAuthentication`, `withRepository`, and/or `withBlob`
will give you access to `authentication`, `repository`, and/or `blob` respectively in the props of the wrapped component.

Nesting them in the proper order, allows the inner higher order components to use the returned objects.
- `withBlob` can use the `repository` object to populate it's Tree for blob selection.
- `withRepository` can use the `authentication` object to populate the Search for repo selection.

## Chaining them together
`withAuthentication(withRepository(withBlob(Component)))`
- Wrapping your component with all of them, in the above order, will automagically render the `Authentication` form.
- When it has a valid login, it will pass the `authentication` object to the `RepositorySearch` selection,
- When it has a repository selected, it will pass the `repository` object to the `Tree` selection,
- When it has a blob selected, it will pass the `blob`, `repository`, and `authentication` objects to the `Component` as props.

### Example
This example shows the minimal configuration and the component just prints out the raw objects that are passed down.

It is highly recommended to manage state in the application, which is shown in the second example.

<Playground>
{() => {
  // Define your React component and optionally access blob in props.
  function Component({
    authentication,
    repository,
    blob,
  }) {
    return (
      <Card>
        <CardHeader
          avatar={<Avatar src={repository.owner.avatar_url} />}
          title={<strong>{blob.path}</strong>}
          subheader={repository.full_name}
        />
        <CardContent>
          <h3>Authentication:</h3>
          <pre>{JSON.stringify(authentication, null, 2)}</pre>
          <h3>Repository:</h3>
          <pre>{JSON.stringify(repository, null, 2)}</pre>
          <h3>Blob:</h3>
          <pre>{JSON.stringify(blob, null, 2)}</pre>
        </CardContent>
      </Card>
    )
  }
  /** Usually you would wrap it during export at the bottom of your component's file.
   *  export default withAuthentication(withRepository(withBlob(Component)));
   */
  const WrappedComponent = withAuthentication(withRepository(withBlob(Component)));
  // Then you can use your blob wrapped component.
  return (
    <Paper>
      <WrappedComponent
        authenticationConfig={{
          server: "https://bg.door43.org/",
          tokenid: "PlaygroundTesting",
        }}
        //** Pass any props as you normally would. */
      />
    </Paper>
  );
}}
</Playground>

## Maintaining Application State
While the each HOC can maintain their own state, it is highly recommended that the application maintains these in their state.
- Each HOC has props that allow state to be passed in, and a callback to propogate changes.
- Authentication: `authentication` and `onAuthentication`
- Repository: `repository` and `onRepository`
- Blob: `blob` and `onBlob`

### Example
This example shows how the state can be managed external to the HOCs.

<Playground>
{() => {
  // Define your React component and optionally access blob in props.
  function Component({
    authentication,
    repository,
    blob,
  }) {
    return (
      <Card>
        <CardHeader
          avatar={<Avatar src={repository.owner.avatar_url} />}
          title={<strong>{blob.path}</strong>}
          subheader={repository.full_name}
        />
        <CardContent>
          <h3>Authentication:</h3>
          <pre>{JSON.stringify(authentication, null, 2)}</pre>
          <h3>Repository:</h3>
          <pre>{JSON.stringify(repository, null, 2)}</pre>
          <h3>Blob:</h3>
          <pre>{JSON.stringify(blob, null, 2)}</pre>
        </CardContent>
      </Card>
    )
  }
  /** Usually you would wrap it during export at the bottom of your component's file.
   *  export default withAuthentication(withRepository(withBlob(Component)));
   */
  const WrappedComponent = withAuthentication(withRepository(withBlob(Component)));
  // Then you can use your blob wrapped component.
  const [authentication, setAuthentication] = useState();
  const [repository, setRepository] = useState();
  const [blob, setBlob] = useState();
  return (
    <Paper>
      <WrappedComponent
        //** Pass any props as you normally would. */
        authenticationConfig={{
          server: "https://bg.door43.org/",
          tokenid: "PlaygroundTesting",
        }}
        /** Use application state to manage authentication/repository/blob objects. */
        authentication={authentication}
        onAuthentication={setAuthentication}
        repository={repository}
        onRepository={setRepository}
        blob={blob}
        onBlob={setBlob}
      />
    </Paper>
  );
}}
</Playground>