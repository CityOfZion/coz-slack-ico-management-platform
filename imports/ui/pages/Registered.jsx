import React, {Component} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import propTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Login from "/imports/ui/pages/Login";
import MainDashboardLogin from "/imports/ui/components/MainDashboardLogin";

const styles = theme => ({
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
  render() {
    const {classes, currentUser} = this.props;
    console.log(currentUser);
    return (
      <div>
        <div className={classes.main}>
          <Paper className={classes.root} elevation={2}>
            <Typography className={classes.title} type="headline" component="h3">
              Registered
            </Typography>
            <Typography className={classes.content} type="body1" component="p">
              {currentUser ? ` You have been registered to ${currentUser.profile.team}, you can now post messages on the slack board.` : ''}
            </Typography>
          </Paper>
        </div>
        <Login title="Login with another Slack" />
        {currentUser && (
          currentUser.profile.user.is_admin ||
          currentUser.profile.user.is_owner ||
          currentUser.profile.user.is_primary_owner) ? <MainDashboardLogin /> :''}
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