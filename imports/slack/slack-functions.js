const getAccess = function (query) {
  const config = ServiceConfiguration.configurations.findOne({service: 'slack'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();
  
  let response;
  try {
    response = HTTP.post(
      "https://slack.com/api/oauth.access", {
        headers: {
          Accept: 'application/json'
        },
        params: {
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.secret),
          redirect_uri: query.redirectUri ? query.redirectUri : OAuth._redirectUri('slack', config),
          state: query.state
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Slack. " + err.message),
      {response: err.response});
  }
  
  if (!response.data.ok) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Slack. " + response.data.error);
  } else {
    return response.data;
  }
};

const getUserInfo = function (accessToken, userId) {
  try {
    let response;
    
    response = HTTP.get(
      "https://slack.com/api/users.info",
      {params: {token: accessToken, user: userId}});
    
    return response.data.ok && response.data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch info from Slack. " + err.message),
      {response: err.response});
  }
};

const getAuthInfo = function (accessToken) {
  try {
    let response;
    response = HTTP.get(
      "https://slack.com/api/auth.test",
      {params: {token: accessToken}});
    
    return response.data.ok && response.data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch info from Slack. " + err.message),
      {response: err.response});
  }
};

const getUserGroups = function (accessToken) {
  try {
    const response = HTTP.get(
      "https://slack.com/api/groups.list",
      {params: {token: accessToken, exclude_archived: true, exclude_members: true}});
    
    return response.data.ok && response.data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch user groups from Slack. " + err.message),
      {response: err.response});
  }
};

const getIdentity = function (accessToken) {
  try {
    const response = HTTP.get(
      "https://slack.com/api/users.identity",
      {params: {token: accessToken}});
    
    return response.data.ok && response.data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Slack. " + err.message),
      {response: err.response});
  }
};

const generateOauthUrl = function(team_id, redirect_params) {
  const scopes = Meteor.settings.bot.config.scopes;
  
  let url = 'https://slack.com/oauth/authorize' + '?client_id=' +
    Meteor.settings.config.clientId + '&scope=' + scopes.join(',');
  
  if (team_id)
    url += '&team=' + team_id;
  
  if (Meteor.settings.config.redirectUri) {
    let redirect_query = '';
    let redirect_uri = Router.path('slack.oauth');
    if (redirect_params) {
      redirect_query += encodeURIComponent(querystring.stringify(redirect_params));
      redirect_uri = redirect_uri + '?' + redirect_query;
    }
    url += '&redirect_uri=' + redirect_uri;
  }
  
  return url;
};

export {
  getAccess,
  getUserInfo,
  getAuthInfo,
  getUserGroups,
  getIdentity,
  generateOauthUrl
};