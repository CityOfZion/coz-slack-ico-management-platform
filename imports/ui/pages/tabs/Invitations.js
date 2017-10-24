import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import Button from 'material-ui/Button'
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Switch from 'material-ui/Switch';
import {FormLabel, FormControl, FormControlLabel} from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import Recaptcha from 'react-recaptcha';

import {createContainer} from 'meteor/react-meteor-data';

const styles = theme => ({
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1vh',
    flexDirection: 'column'
  },
  button: {
    margin: theme.spacing.unit,
  },
  root: theme.mixins.gutters({
    width: '90%',
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column'
  }),
  title: {
    textAlign: 'center',
    marginBottom: '1vh'
  },
  label: {
    textAlign: 'left',
    color: '#1e1e42',
    fontSize: '1.2em'
  },
  chip: {
    margin: theme.spacing.unit / 2,
  },
  content: {
    padding: '1vw',
    wordWrap: 'break-word'
  },
  row: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: '2vh 0 2vh 0',
    display: 'flex'
  },
  paper: {
    width: '90%',
    paddingLeft: '2vw',
    paddingRight: '2vw',
    marginBottom: '1vh'
  }
});

class Donation extends Component {
  
  constructor(props) {
    super(props);
    this.recaptchaInstance = false;
    
    this.state = {
      enableInvitations: false,
      enableLandingPage: true,
      enableCaptcha: true,
      adminToken: '',
      invitationTestResult: '',
      inviteTestEmail: '',
      inviteLimitReached: false,
      inviteLimitReachedTest: false,
      captchaSecret: '',
      captchaResponse: '',
      captchaPublicKey: '',
      loading: true,
      saving: false
    };
  }
  
  componentDidMount() {
    this.checkSubs(this.props);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.loadingUser !== this.props.loadingUser) this.checkSubs(nextProps);
    if (nextProps.loadingTeam !== this.props.loadingTeam) this.checkSubs(nextProps);
    if (nextProps.loadingSettings !== this.props.loadingSettings) this.checkSubs(nextProps);
  }
  
  checkSubs(props) {
    if (!props.loadingTeam && props.team && !props.loadingSettings && props.settings) {
      console.log(props.settings);
      this.setState({captcha: props.settings, ...props.team});
    }
  }
  
  enableInvitations() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>This lets you specify if you want to use this system to manage your
          invites.</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.enableInvitations}
              onChange={(event, checked) => this.setState({enableInvitations: checked})}
            />
          }
          label={this.state.enableInvitations ? "Enabled" : "Disabled"}
        />
      </FormControl>
    );
  };
  
  captchaSecret() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>To be able to use the captcha feature, if you are using your own domain
          name, you will need to register it on google and put the key in here.<br/>
          Please visit <a href="https://www.google.com/recaptcha/admin">this link</a> to add your domain.
        </FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in your secret token"
            value={this.state.captchaSecret}
            margin="normal"
            fullWidth={true}
            onChange={event => this.setState({captchaSecret: event.target.value})}
          />
          <TextField
            label="Fill in your public token"
            value={this.state.captchaPublicKey}
            margin="normal"
            fullWidth={true}
            onChange={event => this.setState({captchaPublicKey: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  enableCaptcha() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Do you want a captcha before a user gets invited.</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.enableCaptcha}
              onChange={(event, checked) => this.setState({enableCaptcha: checked})}
            />
          }
          label={this.state.enableCaptcha ? "Yes" : "No"}
        />
      </FormControl>
    );
  };
  
  enableLandingPage() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Do you want to use this system as a landing page for invites (currently only option, other options will come in the future).</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.enableLandingPage}
              onChange={(event, checked) => this.setState({enableLandingPage: true})}
            />
          }
          label={this.state.enableLandingPage ? "Yes" : "No"}
        />
      </FormControl>
    );
  };
  
  inviteLimitReached() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Test when invitation limit has been reached.</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.inviteLimitReachedTest}
              onChange={(event, checked) => this.setState({inviteLimitReachedTest: checked})}
            />
          }
          label={this.state.inviteLimitReachedTest ? "Yes" : "No"}
        />
      </FormControl>
    );
  };
  
  recaptchaCallback = data => {
    this.setState({captchaResponse: data});
  };
  
  recaptcha() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>To properly test this feature you will need to save the settings first if you
        enabled or disabled the captcha.
      </FormLabel>
      <Recaptcha
        ref={e => this.recaptchaInstance = e}
        sitekey={this.state.captcha.publicKey}
        render="explicit"
        verifyCallback={this.recaptchaCallback}
      />
    </FormControl>
  }
  
  specialAdminToken() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Fill in your special admin token, the only way you can get his token is
          from the Slack website.
          This token allows the bot to deactivate banned user accounts right away. <br/>
          Leave this empty if you don't want the use the functionality.
          <ol>
            <li>Login to slack as an admin</li>
            <li>Go to workspace settings</li>
            <li>Go to manage members and roles</li>
            <li>In chrome open the inspection tool (right mouse + inspect)</li>
            <li>Make sure the network tab is shown</li>
            <li>Select a user to deactivate</li>
            <li>In the network tab click on the button next to the red one (clear)</li>
            <li>Click deactivate account</li>
            <li>Now you will see a new entry show up with: users.admin.setInactive</li>
            <li>Click on it, it should show a lot of information</li>
            <li>Scroll down until you see: Request Payload</li>
            <li>Copy the code starting with <strong>xoxs</strong> into the box below</li>
          </ol>
        </FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in your token"
            value={this.state.adminToken}
            margin="normal"
            fullWidth={true}
            onChange={event => this.setState({adminToken: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  inviteEmail() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Give an email, please test this just once, as it counts towards the invite
          limit reached if that email doesn't accept the invite.</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in an email address"
            value={this.state.inviteTestEmail}
            margin="normal"
            fullWidth={true}
            onChange={event => this.setState({inviteTestEmail: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  invite() {
    if (this.state.inviteLimitReachedTest) {
      Meteor.call('createSharedInvite', Meteor.user().profile.auth.team_id, this.state.captchaResponse, (err, res) => {
        console.log('createSharedInvite', err, res);
        if (res.error) {
          this.setState({
            invitationTestResult: `Error: ${res.error}`
          });
          if(this.state.enableCaptcha) this.recaptchaInstance.reset();
        } else if(res.refresh) {
          this.setState({
            invitationTestResult: `Error: ${res.refresh}`
          });
          if(this.state.enableCaptcha) this.recaptchaInstance.reset();
        } else {
          this.setState({
            invitationTestResult: `The user will be redirected to this URL which is valid for 5 minutes: ${res.result || res.error}`
          });
        }
      });
    } else {
      Meteor.call('createAdminEmailInvite', Meteor.user().profile.auth.team_id, this.state.inviteTestEmail, this.state.captchaResponse, (err, res) => {
        if (res.error) {
          this.setState({invitationTestResult: 'Error:' + res.error});
          if(this.state.enableCaptcha) this.recaptchaInstance.reset();
        } else {
          this.setState({invitationTestResult: res.result});
        }
      });
    }
  }
  
  testInvitations() {
    return <div>
      <Button raised className="button-info" onClick={e => this.invite()}>
        Test invitation
      </Button>
    </div>
  }
  
  saveSettings = () => {
    
    this.setState({saving: true});
    const data = {...this.state};
    
    delete data.loading;
    delete data.saving;
    delete data.invitationTestResult;
    delete data.inviteTestEmail;
    delete data.inviteLimitReachedTest;
    delete data.captchaResponse;
    
    Meteor.call('saveSettings', data, false, (err, res) => {
      Meteor.setTimeout(() => this.setState({saving: false}), 1000);
    });
  };
  
  render() {
    const {classes} = this.props;
    
    return (
      <div className={classes.main}>
        <Typography className={classes.title} type="headline" component="h3">
          Invitations
        </Typography>
        <Paper className={classes.paper} elevation={3}>
          <Typography className={classes.content} type="body1" component="p">
            There are multiple ways to manage invitations, one is through API the other through invitations links.<br/>
            For some teams the API method has been disabled by Slack and you will receive an error with <strong>invite_limit_reached</strong>.
            This system is made so that a fallback will be used if this error presents itself.<br />
            <br />
            If you activate this system your invite link will be here: <strong>https://slack-helper.cityofzion.io/invite/{this.props.team.id}</strong>
          </Typography>
        </Paper>
        <Paper className={classes.paper} elevation={3}>
          {this.enableInvitations()}
          {this.state.enableInvitations && (!this.props.team.settings.adminToken || this.props.team.settings.adminToken.trim() === '') ? this.specialAdminToken() : ''}
          {this.state.enableInvitations ? this.enableCaptcha() : ''}
          
          {this.state.enableCaptcha && !this.state.enableLandingPage ? this.captchaSecret() : ''}
          {this.state.enableInvitations ? this.enableLandingPage() : ''}
        </Paper>
        
        {this.state.enableInvitations ?
          <Paper className={classes.paper} elevation={3}>
            <Typography className={classes.content} type="body1" component="p">
              <strong>Result will be shown here: </strong><br/>
              {this.props.team.settings.inviteLimitReached ? ''
                : ''}
              {this.state.invitationTestResult}
            </Typography>
            {this.inviteLimitReached()}
            {!this.state.inviteLimitReachedTest ? this.inviteEmail() : ''}
            {this.state.enableCaptcha ? this.recaptcha() : ''}
            {this.testInvitations()}
          </Paper>
          : ''}
        
        {this.state.saving ?
          <Button raised className="button-warning">
            Saved
          </Button>
          :
          <Button raised className="button-primary" onClick={e => this.saveSettings()}>
            Save Settings
          </Button>
        }
      </div>
    );
  }
}

Donation.propTypes = {
  classes: PropTypes.object.isRequired,
};

const DonationContainer = createContainer(() => {
  const currentUser = Meteor.user();
  const teamSubscription = Meteor.subscribe('getTeam');
  const userSubscription = Meteor.subscribe('user');
  const settingsSubscription = Meteor.subscribe('recaptchaPublicKey');
  const loadingSettings = !settingsSubscription.ready();
  const settings = AppSettings.findOne({});
  
  const loadingTeam = !teamSubscription.ready();
  const loadingUser = !userSubscription.ready();
  
  const team = Teams.findOne({id: currentUser ? currentUser.profile.auth.team_id : ''}) || null;
  
  console.log(settings);
  
  return {
    currentUser: currentUser,
    loadingUser: loadingUser,
    loadingSettings: loadingSettings,
    settings: settings,
    team: team,
    loadingTeam: loadingTeam,
  };
}, Donation);

export default withStyles(styles)(DonationContainer);