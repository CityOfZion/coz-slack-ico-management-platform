import { Meteor } from 'meteor/meteor';
import {getAccess, getUserInfo, getUserGroups, getIdentity, getAuthInfo} from '/imports/slack/slack-functions.js';

if(Meteor.isServer) {

  Slack = {};

  OAuth.registerService('slack', 2, null, function (query) {
    const access = getAccess(query);
    let team = Teams.findOne({id: access.team && access.team.id ? access.team.id : access.team_id});
  
    const isTeam = !!team;
    
    const accessToken = access.access_token;
    const authInfo = getAuthInfo(accessToken);
    const identity = getIdentity(accessToken);
    
    let userInfo = getUserInfo(isTeam ? team.oauth.access_token : accessToken, access.user && access.user.id ? access.user.id : access.user_id);
  
    const profile = Object.assign(authInfo, userInfo);
  
    if(!isTeam && profile.team_id) {
      team = {
        id: profile.team_id,
        name: profile.team,
        url: profile.url,
        oauth: access,
        settings: {}
      };
      
      Teams.insert(team);
    }
    
    return {
      serviceData: {
        id: access.user_id,
        accessToken: accessToken
      },
      options: {
        profile: {
          identity: identity,
          auth: authInfo,
          info: userInfo
        }
      }
    };
  });

  Slack.retrieveCredential = function (credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
  };
}