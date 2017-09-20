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
  
  console.log('----------SLACK OAUTH RESPONSE DATA---------');
  console.log(response.data);
  
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
  
    console.log('getUserInfo', response.data);
  
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
    
    console.log('getAuthInfo', response.data);
  
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
    
    console.log('getIdentity', response.data);
    return response.data.ok && response.data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Slack. " + err.message),
      {response: err.response});
  }
};

const oauth = function (payload) {
  console.log(payload);
  try {
    if (!payload.identity.team_id) {
    }
    const team = Teams.find({
      id: payload.identity.team_id
    });
    
    const newTeam = {
      id: payload.identity.team_id,
      createdBy: payload.identity.user_id,
      url: payload.identity.url,
      name: payload.identity.team,
    };
    
    newTeam.bot = {
      token: payload.bot.bot_access_token,
      user_id: payload.bot.bot_user_id,
      createdBy: payload.identity.user_id,
      app_token: payload.access_token,
    };
    
    const authTest = getUserInfo();
    
    newTeam.bot.name = authTest.user;
    authTest.identity = authTest;
    authTest.team_info = newTeam;
    
    if (team.count() === 0) {
      Teams.insert(newTeam);
    } else {
      Teams.findOneAndUpdate({
        id: newTeam.id
      }, {
        $set: newTeam
      });
    }
    
  } catch (e) {
    console.log(e);
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
  generateOauthUrl,
  oauth
};