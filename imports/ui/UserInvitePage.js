import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import Button from 'material-ui/Button'
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import {CircularProgress} from 'material-ui/Progress';
import {FormLabel, FormControl, FormControlLabel, FormHelperText} from 'material-ui/Form';
import Recaptcha from 'react-recaptcha';
import TextField from 'material-ui/TextField';

import {createContainer} from 'meteor/react-meteor-data';

const styles = theme => ({
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%"
  },
  button: {
    margin: theme.spacing.unit,
  },
  title: {
    textAlign: 'center',
    marginBottom: '1vh'
  },
  label: {
    textAlign: 'center',
    color: '#1e1e42',
    fontSize: '1.2em',
    padding: '0.3em'
  },
  content: {
    padding: '1vw',
    wordWrap: 'break-word'
  },
  formControl: {
    margin: '2vh 0 0 0',
    display: 'flex'
  },
  paper: {
    paddingLeft: '2vw',
    paddingRight: '2vw',
    marginBottom: '1vh'
  },
  iconRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  errorMessage: {
    color: '#ff0000',
    fontSize: '1em',
    margin: 0,
    padding: 0,
    marginBottom: '1vh',
    textAlign: 'center'
  }
});

class UserInvitePage extends Component {
  
  constructor(props) {
    super(props);
  
    this.recaptchaInstance = false;
    
    this.state = {
      invited: false,
      enableInvitations: false,
      inviteEmail: '',
      result: '',
      resultError: '',
      activeUsers: 0,
      totalUsers: 0,
      activeUsersError: '',
      icon: '',
      captchaResponse: ''
    };
    this.getActiveUserCount();
    Meteor.setInterval(() => {
      Meteor.bindEnvironment(this.getActiveUserCount())
    }, 15000);
  }
  
  componentDidMount() {
    this.checkSubs(this.props);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.loadingTeam !== this.props.loadingTeam) this.checkSubs(nextProps);
  }
  
  checkSubs(props) {
    if (!props.loadingTeam && props.team) {
      this.setState({...props.team});
      this.getTeamIcon(props.team.icon);
    }
  }
  
  recaptchaCallback = data => {
    this.setState({captchaResponse: data});
  };
  
  recaptcha() {
    return <Recaptcha
      ref={e => this.recaptchaInstance = e}
      sitekey={this.state.settings.captchaPublicKey}
      render="explicit"
      verifyCallback={this.recaptchaCallback}
    />
  }
  
  requestForm() {
    const {classes} = this.props;
    return <div className={classes.main} id="container">
      {this.state.settings.enableInvitations ?
        <div className={classes.main}>
          <FormControl className={classes.formControl} component="fieldset">
            <FormLabel className={classes.label}>
              <div className={classes.iconRow}>
                {this.state.icon.image_88 ? <div><img src={this.state.icon.image_88}/></div> : <CircularProgress size={88}/>} <span
                style={{padding: '2vw'}}> + </span><img src="/images/slack.svg" width="88" height="88"/>
              </div>
            </FormLabel>
            
            <FormLabel className={classes.label}>
              <strong>{this.state.activeUsers}</strong> out of <strong>{this.state.totalUsers}</strong> users online
            </FormLabel>
            
            <FormLabel className={classes.label}>
              Join <strong>{this.state.name}</strong> on Slack!
            </FormLabel>
            
            {this.state.result !== '' ?
              <FormLabel className={classes.label}>
                {this.state.result}
              </FormLabel>
              : ''}
              
            {this.state.settings.inviteLimitReached ? '' :
            <div className={classes.row}>
              <TextField
                label="Fill in your email address"
                value={this.state.inviteEmail}
                margin="normal"
                fullWidth={true}
                onChange={event => this.setState({inviteEmail: event.target.value})}
              />
              <FormHelperText className={classes.errorMessage}>{this.state.resultError}</FormHelperText>
            </div>}
            
            {this.state.settings.enableCaptcha ? this.recaptcha() : ''}
            
          </FormControl>
          {this.state.invited ?
            <Button raised className="button-warning">
              {this.state.result !== '' ? this.state.result : 'Trying to invite'}
            </Button>
            :
            <Button raised className="button-primary" onClick={e => this.invite()}>
              Request invite <br />{this.state.settings.inviteLimitReached ? '(this will redirect you)' : ''}
            </Button>
          }
  
          <Button raised className="button-info" onClick={e => window.location.href = this.props.team.url}>
            Or go to our slack here
          </Button>
        </div>
        : 'This team does not accept new invites'}
    </div>
  }
  
  invite() {
    this.setState({invited: true});
    if (this.state.settings.inviteLimitReached) {
      Meteor.call('createSharedInvite', Router.current().params.teamId, this.state.captchaResponse, (err, res) => {
        console.log(res);
        if (res.error) {
          this.setState({invited: false, resultError: res.error});
          if(this.state.settings.enableCaptcha) this.recaptchaInstance.reset();
        } else {
          window.location = res.result;
        }
      });
    } else {
      Meteor.call('createAdminEmailInvite', Router.current().params.teamId, this.state.inviteEmail, this.state.captchaResponse, (err, res) => {
        console.log(res);
        if (res.error) {
          this.setState({invited: false, resultError: res.error});
          if(this.state.settings.enableCaptcha) this.recaptchaInstance.reset();
        } else if(res.refresh) {
          window.location.reload();
        } else {
          this.setState({result: res.result});
        }
      });
    }
  }
  
  getActiveUserCount() {
    Meteor.call('getActiveUserCount', Router.current().params.teamId, (err, res) => {
      this.setState({...res});
    });
  }
  
  getTeamIcon(icon) {
    if(!icon) {
      Meteor.call('getTeamIcon', Router.current().params.teamId, (err, res) => {
        this.setState({icon: res});
      });
    }
  }
  
  render() {
    document.title = `Join ${this.state.name} on Slack!`;
    const {classes} = this.props;
    return (
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={3}>
          {!this.state.settings ? <CircularProgress size={250}/> :
            this.requestForm()
          }
        </Paper>
      </div>
    );
  }
}

UserInvitePage.propTypes = {
  classes: PropTypes.object.isRequired,
};

const UserInvitePageContainer = createContainer(() => {
  const teamSubscription = Meteor.subscribe('getTeamByIdForInvite', Router.current().params.teamId);
  const loadingTeam = !teamSubscription.ready();
  const team = Teams.findOne({id: Router.current().params.teamId});
  
  return {
    team: team,
    loadingTeam: loadingTeam
  };
}, UserInvitePage);

export default withStyles(styles)(UserInvitePageContainer);