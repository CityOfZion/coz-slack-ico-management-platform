import React, {Component} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import propTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Login from "/imports/ui/pages/Login";
import Button from "material-ui/Button";
import MainDashboardLogin from "/imports/ui/components/MainDashboardLogin";
import {isAdmin} from '/imports/slack/helpers'

const styles = theme => ({
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1vh'
  },
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
  root: theme.mixins.gutters({
    width: '50vw',
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    textAlign: 'center'
  }),
  title: {
    textAlign: 'center'
  },
  content: {
    textAlign: 'center'
  }
});

class Registered extends Component {
  
  goToSlack() {
    Router.redirect(this.props.currentUser.profile.auth.url);
  }
  
  render() {
    console.log(Meteor.user())
    const {classes, currentUser} = this.props;
    return (
      <div>
        <div className={classes.main}>
          <Paper className={classes.root} elevation={2}>
            <Typography className={classes.title} type="headline" component="h3">
              Registered
            </Typography>
            <Typography className={classes.content} type="body1" component="p">
              {currentUser ? ` You have been registered to ${currentUser.profile.auth.team}, you can now post messages on the slack board.` : ''}
            </Typography>
            <Button raised color="primary" className={classes.button} onClick={this.goToSlack}>
              Go back to Slack
            </Button>
          </Paper>
        </div>
        <Login title="Login with another Slack" />
        {isAdmin(currentUser) ? <MainDashboardLogin /> :''}
      </div>
    );
  }
}

Registered.propTypes = {
  currentUser: propTypes.any
};

const RegisteredContainer = createContainer(() => {
  return {
    currentUser: Meteor.user()
  }
}, Registered);

export default withStyles(styles)(RegisteredContainer);