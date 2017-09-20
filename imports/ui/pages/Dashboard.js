import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import Button from 'material-ui/Button'
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Switch from 'material-ui/Switch';
import {FormLabel, FormControl, FormControlLabel} from 'material-ui/Form';
import Chip from 'material-ui/Chip';
import TextField from 'material-ui/TextField';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';

import {createContainer} from 'meteor/react-meteor-data';

const styles = theme => ({
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2vh'
  },
  button: {
    margin: theme.spacing.unit,
  },
  root: theme.mixins.gutters({
    width: '50vw',
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
    paddingLeft: '2vw',
    paddingRight: '2vw',
    marginBottom: '1vh'
  }
});

class Dashboard extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      forceUserSignup: true,
  
      allowReminders: false,
      allowUserReminders: false,
  
      askBeforeBan: false,
      allowUserReport: true,
      
      warnUserAboutScam: true,
  
      removeDmSpam: false,
      removeBannedUserMessages: true,
      removeLinks: true,
      removeDuplicateUserNames: true,
      removePublicChannelSpam: true,
      
      triggerWords: [],
      reportsNeededForBan: 5,
      restrictedUserNames: [],
      userScamWarningMessage: '',
      triggerWord: '',
      warningMessageChannel: '',
      restrictedUserName: '',
      saving: false
    }
  }
  
  componentDidMount() {
    this.checkSubs(this.props);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.loadingUser !== this.props.loadingUser) this.checkSubs(nextProps);
    if(nextProps.loadingTeam !== this.props.loadingTeam) this.checkSubs(nextProps);
  }
  
  checkSubs(props) {
    if (!props.loadingTeam && props.team) {
      this.setState({...props.team.settings});
    }
  }
  
  saveSettings = () => {
    this.setState({saving: true});
    const data = {...this.state};
    delete data.saving;
    delete data.triggerWord;
    delete data.restrictedUserName;
    
    Meteor.call('saveSettings', data, (err, res) => {
      this.setState({triggerWord: ''});
      Meteor.setTimeout(() => this.setState({saving: false}), 10000);
    });
  };
  
  handleWordRemove = data => () => {
    const triggerWords = [...this.state.triggerWords];
    const wordToDelete = triggerWords.indexOf(data);
    triggerWords.splice(wordToDelete, 1);
    this.setState({triggerWords});
  };
  
  handleUserNameRemove = data => () => {
    const usernames = [...this.state.removeDuplicateUserNames];
    const nameToDelete = usernames.indexOf(data);
    usernames.splice(nameToDelete, 1);
    this.setState({usernames});
  };
  
  handleWordAdd = event => {
    this.setState({triggerWord: event.target.value});
  };
  
  handleUserNameAdd = event => {
    this.setState({restrictedUserName: event.target.value});
  };
  
  triggerWords(){
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Specify words or sentences here that trigger the spam filter, this counts for messages in public channels and for private messages.</FormLabel>
        <div className={classes.row}>
          <TextField
            id="filterWords"
            label="Fill in a word or sentence to filter on"
            value={this.state.triggerWord}
            className={classes.input}
            margin="normal"
            fullWidth={true}
            onKeyPress={(ev) => {
              if (ev.key === 'Enter') {
                const triggerWords = this.state.triggerWords;
                triggerWords.push(this.state.triggerWord);
                this.setState({triggerWords: triggerWords, triggerWord: ''});
                ev.preventDefault();
              }
            }}
            onChange={this.handleWordAdd}
          />
          {this.state.triggerWords ? this.state.triggerWords.map((data, index) => {
            return (
              <Chip
                label={data}
                key={index}
                onRequestDelete={this.handleWordRemove(data)}
                className={classes.chip}
              />
            );
          }) : ''}
        </div>
      </FormControl>
    );
  };
  
  userScamWarningMessage(){
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Specify a message to send to users as a warning when they receive a potential scam message.</FormLabel>
        <div className={classes.row}>
          <TextField
            multiline
            rowsMax="5"
            rows="3"
            label="Fill in a message to send to users"
            value={this.state.userScamWarningMessage}
            margin="normal"
            fullWidth={true}
            onChange={event => this.setState({userScamWarningMessage: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  warningMessageChannel(){
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Specify a channel where warning messages will be sent (some cases action need manual action).</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in a channel"
            value={this.state.warningMessageChannel}
            margin="normal"
            fullWidth={true}
            onChange={event => this.setState({warningMessageChannel: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  allowUserReminders() {
    const {classes, title} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>This allows non admin users to set reminders for users/channels</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.allowUserReminders}
              onChange={(event, checked) => this.setState({allowUserReminders: checked})}
            />
          }
          label={this.state.allowUserReminders ? "Allowing user reminders" : "Not allowing user reminders"}
        />
      </FormControl>
    )
  };
  
  forceUserSignup() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This option will force users to sign up to this platform, if they are not signed up their messages will be deleted.</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.forceUserSignup}
            onChange={(event, checked) => this.setState({forceUserSignup: checked})}
          />
        }
        label={this.state.forceUserSignup ? "Forcing users to sign up" : "Sign up not required"}
      />
    </FormControl>
  }
  
  allowReminders() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This allows reminders for users, if this is on, admins will be able to make reminders for users/channels.</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.allowReminders}
            onChange={(event, checked) => this.setState({allowReminders: checked, allowUserReminders: false})}
          />
        }
        label={this.state.allowReminders ? "Allowing reminders" : "Not allowing reminders"}
      />
    </FormControl>
  }
  
  removeDmSpam() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This option removes suspicious messages from direct messages to users. Messages are marked as suspicious if they contain one of the words specified below. <br />This will cause issues if the user hasn't registered</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.removeDmSpam}
            onChange={(event, checked) => this.setState({removeDmSpam: checked})}
          />
        }
        label={this.state.removeDmSpam ? "Removing suspicious DM's" : "Not removing suspicious DM's"}
      />
    </FormControl>
  }
  
  removePublicSpam() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This option removes suspicious messages from the public channels, based on the words specified below.</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.removePublicChannelSpam}
            onChange={(event, checked) => this.setState({removePublicChannelSpam: checked})}
          />
        }
        label={this.state.removePublicChannelSpam ? "Removing suspicious messages" : "Not removing suspicious messages"}
      />
    </FormControl>
  }
  
  warnUserAboutSpam() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This option sends the user a message when a suspicious private message has been spotted, specify your message below.</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.warnUserAboutScam}
            onChange={(event, checked) => this.setState({warnUserAboutScam: checked})}
          />
        }
        label={this.state.warnUserAboutScam ? "Send user a warning" : "Do not send a warning"}
      />
    </FormControl>
  }
  
  allowUserReport() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This option lets users report scammers on their own with /report @user [reason].</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.allowUserReport}
            onChange={(event, checked) => this.setState({allowUserReport: checked})}
          />
        }
        label={this.state.allowUserReport ? "Let users report" : "Do not let users report"}
      />
    </FormControl>
  }
  
  reportsNeededForBan() {
    const {classes} = this.props;
    
    const options = () => {
      const map = [];
      for(let i = 1; i < 30; i++) {
        map.push(<MenuItem key={'option' + i} value={i}>{i}</MenuItem>);
      }
      
      return map;
    };
    
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>How many user reports are needed before a user is banned.</FormLabel>
        <Select
          value={this.state.reportsNeededForBan}
          onChange={e => this.setState({reportsNeededForBan: e.target.value})}
          input={<Input id="target-number" />}
        >
          {options()}
        </Select>
    </FormControl>
  }
  
  askBeforeBan() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This option notifies the admin with a suspicious user and gives the option to ban him from the message. It might however cause issues when there are no admins online.</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.askBeforeBan}
            onChange={(event, checked) => this.setState({askBeforeBan: checked})}
          />
        }
        label={this.state.askBeforeBan ? "Asking admins before banning a user" : "Banning users automatically"}
      />
    </FormControl>
  }
  
  removeLinks() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This option removes all urls from non-admin users in private and public messages.</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.removeLinks}
            onChange={(event, checked) => this.setState({removeLinks: checked})}
          />
        }
        label={this.state.removeLinks ? "Removing all urls from users" : "Allowing urls from users"}
      />
    </FormControl>
  }
  
  removeDuplicateUserNames() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This option removes all users who try to create a user with a username that already exists.</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.removeDuplicateUserNames}
            onChange={(event, checked) => this.setState({removeDuplicateUserNames: checked})}
          />
        }
        label={this.state.removeDuplicateUserNames ? "Removing all duplicate usernames" : "Allowing duplicate usernames"}
      />
    </FormControl>
  }
  
  removeUserNames(){
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>List usernames here that are protected</FormLabel>
        <div className={classes.row}>
          <TextField
            id="filterUsernames"
            label="Fill in a username to restrict"
            value={this.state.restrictedUserName}
            className={classes.input}
            margin="normal"
            fullWidth={true}
            onKeyPress={(ev) => {
              if (ev.key === 'Enter') {
                const usernames = this.state.restrictedUserNames;
                usernames.push(this.state.restrictedUserName);
                this.setState({restrictedUserNames: usernames, restrictedUserName: ''});
                ev.preventDefault();
              }
            }}
            onChange={this.handleUserNameAdd}
          />
          {this.state.restrictedUserNames ? this.state.restrictedUserNames.map((data, index) => {
            return (
              <Chip
                label={data}
                key={index}
                onRequestDelete={this.handleUserNameRemove(data)}
                className={classes.chip}
              />
            );
          }) : ''}
        </div>
      </FormControl>
    );
  };
  
  removeBannedMessages() {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>This option will remove any messages from banned users, public and private.</FormLabel>
      <FormControlLabel
        control={
          <Switch
            checked={this.state.removeBannedUserMessages}
            onChange={(event, checked) => this.setState({removeBannedUserMessages: checked})}
          />
        }
        label={this.state.removeBannedUserMessages ? "Removing all banned user's message" : "Allowing banned use messages"}
      />
    </FormControl>
  }
  
  render() {
    const {classes} = this.props;
    return (
      <div className={classes.main}>
        <Paper className={classes.root} elevation={3}>
          <Typography className={classes.title} type="headline" component="h3">
            Anti Spam/Scam settings
          </Typography>
          <Paper className={classes.paper} elevation={3}>
            {this.forceUserSignup()}
          </Paper>
  
          <Paper className={classes.paper} elevation={3}>
            {this.warningMessageChannel()}
          </Paper>
          
          {/*{this.askBeforeBan()}*/}
          <Paper className={classes.paper} elevation={3}>
            {this.removeBannedMessages()}
            {this.removePublicSpam()}
            {this.removeDmSpam()}
            {this.triggerWords()}
          </Paper>
  
          <Paper className={classes.paper} elevation={3}>
            {this.allowReminders()}
            {this.state.allowReminders ? this.allowUserReminders() : ''}
          </Paper>
          
          <Paper className={classes.paper} elevation={3}>
          </Paper>
  
          <Paper className={classes.paper} elevation={3}>
            {this.warnUserAboutSpam()}
            {this.state.warnUserAboutScam ? this.userScamWarningMessage() : ''}
            {this.allowUserReport()}
            {this.state.allowUserReport ? this.reportsNeededForBan() : ''}
          </Paper>
  
          <Paper className={classes.paper} elevation={3}>
           {this.removeLinks()}
          </Paper>
  
          <Paper className={classes.paper} elevation={3}>
            {this.removeDuplicateUserNames()}
            {this.state.removeDuplicateUserNames ? this.removeUserNames() : ''}
          </Paper>
  
          {this.state.saving ?
            <Button raised color="accent" className={classes.button}>
              Saved! Waiting to restart the bot
            </Button>
          :
            <Button raised color="primary" className={classes.button} onClick={e => this.saveSettings()}>
              Save Settings
            </Button>
          }
        </Paper>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

const DashboardContainer = createContainer(() => {
  const currentUser = Meteor.user();
  const teamSubscription = Meteor.subscribe('getTeam');
  const userSubscription = Meteor.subscribe('user');
  const loadingTeam = !teamSubscription.ready();
  const loadingUser = !userSubscription.ready();
  const team = Teams.findOne({id: currentUser ? currentUser.profile.team_id : ''}) || false;
  
  return {
    currentUser: currentUser,
    loadingUser: loadingUser,
    team: team,
    loadingTeam: loadingTeam
  };
}, Dashboard);

export default withStyles(styles)(DashboardContainer);