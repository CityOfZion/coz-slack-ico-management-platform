import React from 'react';
import MainLayout from "/imports/ui/MainLayout";
import Login from "/imports/ui/pages/Login";
import Registered from "/imports/ui/pages/Registered";
import Dashboard from "/imports/ui/pages/Dashboard";
import UserInvitePage from "/imports/ui/UserInvitePage";

Router.route('/', {
  onBeforeAction() {
    if (Meteor.loggingIn() || Meteor.userId()) {
      this.redirect('/registered');
    }
    this.next();
  
  },
  action() {
    ReactLayout.render(MainLayout, {content: <Login/>});
  }
});

Router.route('/registered', {
  onBeforeAction() {
    if (!(Meteor.userId() || Meteor.loggingIn())) {
      this.redirect('/');
    }
    this.next();
  
  },
  action() {
    ReactLayout.render(MainLayout, {content: <Registered/>});
  }
});

Router.route('/dashboard', {
  subscriptions() {
    Meteor.subscribe('getTeam');
    Meteor.subscribe('user');
  },
  onBeforeAction() {
    if (!Meteor.userId()) {
      this.redirect('/');
    }
    this.next();
  },
  action() {
    ReactLayout.render(MainLayout, {content: <Dashboard/>});
  }
});

Router.route('/invite/:teamId', {
  subscriptions() {
    Meteor.subscribe('getTeamByIdForInvite', this.params.teamId);
  },
  action() {
    ReactLayout.render(UserInvitePage);
  }
});