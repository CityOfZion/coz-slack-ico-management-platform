import React, {Component} from 'react';
import Button from 'material-ui/Button'
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

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
  },
  paper: {
    paddingLeft: '2vw',
    paddingRight: '2vw',
    marginBottom: '1vh'
  }
});

class Login extends Component {
  
  constructor() {
    super();
    
    this.state = {
      loginError: ''
    }
  }
  
  handleSlackLogin() {
    Meteor.loginWithSlack({
      requestPermissions: [
        'identity.email',
        'identity.basic',
        'identity.team',
        'identity.avatar'
      ]
    }, (res, err) => {
      console.log(err, res);
      if (!err) {
        Router.redirect('/registered');
      } else {
        Router.redirect('/');
        this.setState({loginError: err});
      }
    });
  }
  
  handleAddToSlack() {
    Meteor.loginWithSlack({
      requestPermissions: [
        'im:read',
        'channels:history',
        'im:history',
        'users:read',
        'bot',
        'admin',
        'channels:read',
        'channels:write',
        'chat:write:bot',
        'chat:write:user',
        'im:write',
        'reminders:read',
        'reminders:write',
        'team:read',
        'users.profile:read',
        'users.profile:write',
        'users:write',
        'users:read.email',
        'commands'
      ]
    }, (res, err) => {
      console.log(err, res);
      if (!err) {
        Router.redirect('/registered');
      } else {
        Router.redirect('/');
        this.setState({loginError: err});
      }
    });
  }
  
  render() {
    const {classes, title} = this.props;
    return (
      <div>
        <div className={classes.main}>
          <Paper className={classes.root} elevation={3}>
            <Typography className={classes.title} type="headline" component="h3">
              {title ? title : 'We require permissions'}
            </Typography>
            <Typography className={classes.content} type="body1" component="p">
              Logging in with Slack will ask you for permissions, we will never use any of these to read your private
              messages.
              These permissions are so we can see if there is an attempt to scam you.
            </Typography>
            <Typography className={classes.content} type="body1" component="p">
              Please select the team you want to apply to after you click Login.
            </Typography>
            <Button raised color="primary" className={classes.button} onClick={this.handleSlackLogin}>
              Login with Slack
            </Button>
          </Paper>
        </div>
        <div className={classes.main}>
          <Paper className={classes.root} elevation={3}>
            <Typography className={classes.title} type="headline" component="h3">
              For Admins
            </Typography>
            <Typography className={classes.content} type="body1" component="p">
              Adding to Slack will ask you for permissions, we will never use any of these to read your private
              messages.
              These permissions are so we can see if there is an attempt to scam you.
            </Typography>
            <Button raised color="primary" className={classes.button} onClick={this.handleAddToSlack}>
              Add to Slack
            </Button>
          </Paper>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login);