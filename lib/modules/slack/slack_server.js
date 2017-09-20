import { Meteor } from 'meteor/meteor';
import {getAccess, getUserInfo, getUserGroups, getIdentity, getAuthInfo} from '/imports/slack/slack-functions.js';

if(Meteor.isServer) {

  Slack = {};

  OAuth.registerService('slack', 2, null, function (query) {
    const access = getAccess(query);
    const accessToken = access.access_token;
    const authInfo = getAuthInfo(accessToken);
    const userInfo = getUserInfo(accessToken, access.user_id);
    
    const profile = Object.assign(authInfo, userInfo);
  
    const isTeam = Teams.find({id: profile.team_id}).count() > 0;
    
    if(!isTeam) {
      Teams.insert({
        id: profile.team_id,
        name: profile.team,
        url: profile.url,
        oauth: access,
        settings: {
          forceUserSignup : false,
          allowReminders : true,
          allowUserReminders : false,
          askBeforeBan : false,
          allowUserReport : true,
          warnUserAboutScam : true,
          removeDmSpam : true,
          removeBannedUserMessages : true,
          removeLinks : true,
          removeDuplicateUserNames : true,
          removePublicChannelSpam : true,
          triggerWords : [],
          reportsNeededForBan : 5,
          restrictedUserNames : [ ],
          userScamWarningMessage : "Be careful, this message has been flagged as spam/scam."
        }
      });
    }
    
    return {
      serviceData: {
        id: access.user_id,
        accessToken: accessToken
      },
      options: {
        profile: profile
      }
    };
  });

  Slack.retrieveCredential = function (credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
  };
}