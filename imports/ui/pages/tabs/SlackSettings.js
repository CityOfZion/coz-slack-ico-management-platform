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
import Dialog from 'material-ui/Dialog';

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
    width: '96%'
  },
  root: theme.mixins.gutters({
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
  content: {
    padding: '1vw'
  },
  paper: {
    width: '90%',
    paddingLeft: '2vw',
    paddingRight: '2vw',
    marginBottom: '1vh'
  },
  dialog :{
    justifyContent: 'center',
    textAlign: 'center'
  }
});

class SlackSettings extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      limitFileUploads: false,
      fileSizeLimit: 0,
      fileExpireDays: 0,
      messageExpireDays: 0,
      deleteOldMessages: false,
      saving: false,
      importPastMessagesDialog: false,
      importingMessages: false
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
  
  limitFileUploads() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Enable file upload limitations</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.limitFileUploads}
              onChange={(event, checked) => this.setState({limitFileUploads: checked})}
            />
          }
          label={this.state.limitFileUploads ? "Enabled" : "Disabled"}
        />
      </FormControl>
    )
  }
  
  deleteOldMessages() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Enable message expiration (public channels only, except #announcements)</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.deleteOldMessages}
              onChange={(event, checked) => this.setState({deleteOldMessages: checked})}
            />
          }
          label={this.state.deleteOldMessages ? "Enabled" : "Disabled"}
        />
      </FormControl>
    )
  }
  
  fileSizeLimit(){
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Limit the size of files users can upload</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in the size in kilobytes (0 is unlimited)"
            value={this.state.fileSizeLimit}
            margin="normal"
            type="number"
            fullWidth={true}
            onChange={event => this.setState({fileSizeLimit: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  fileExpireDays(){
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>This option removes files after a certain number of days</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in the number of days (0 is unlimited)"
            value={this.state.fileExpireDays}
            margin="normal"
            type="number"
            fullWidth={true}
            onChange={event => this.setState({fileExpireDays: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  importMessages() {
    this.setState({importingMessages: true, importPastMessagesDialog: false});
    
    Meteor.call('importMessages', function() {
    
    });
  }
  
  importPastMessagesDialog() {
    const {classes} = this.props;
    
    const actions = [
      <Button
        raised
        color="accent"
        className={classes.button}
        onClick={e => this.importMessages()}
      >
        Import
      </Button>,
      <Button
        raised
        color="accent"
        className={classes.button}
        onClick={e => this.setState({importPastMessagesDialog: false})}
      >
        Cancel
      </Button>,
    ];
    
    return <div>
      <Button raised color="accent" className={classes.button} disabled={this.state.importingMessages}>Import past messages</Button>
      <Dialog
        title="Import past messages"
        actions={actions}
        modal={true}
        open={this.state.importPastMessagesDialog}
        style={classes.dialog}
      >
        Warning, this action will be performed on the server and may take some time to finish.
      </Dialog>
    </div>
  }
  
  messageExpireDays(){
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Specify the number of days before messages expire</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in the number of days (0 is unlimited)"
            value={this.state.messageExpireDays}
            margin="normal"
            type="number"
            fullWidth={true}
            onChange={event => this.setState({messageExpireDays: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  saveSettings = () => {
    this.setState({saving: true});
    const data = {...this.state};
    
    Meteor.call('saveSettings', data, (err, res) => {
      Meteor.setTimeout(() => this.setState({saving: false}), 5000);
    });
  };
  
  render() {
    const {classes} = this.props;
    return (
      <div className={classes.main}>
        <Typography className={classes.title} type="headline" component="h3">
          Slack Settings
        </Typography>
        
        <Paper className={classes.paper} elevation={3}>
          {this.limitFileUploads()}
          {this.state.limitFileUploads ? this.fileSizeLimit() : ''}
          {this.state.limitFileUploads ? this.fileExpireDays() : ''}
        </Paper>
        
        <Paper className={classes.paper} elevation={3}>
          {this.deleteOldMessages()}
          {this.state.deleteOldMessages ? this.messageExpireDays() : ''}
        </Paper>
        
        {this.state.saving ?
          <Button raised className="button-warning">
            Saved! Waiting to restart the bot
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

SlackSettings.propTypes = {
  classes: PropTypes.object.isRequired,
};

const SlackSettingsContainer = createContainer(() => {
  const currentUser = Meteor.user();
  const teamSubscription = Meteor.subscribe('getTeam');
  const userSubscription = Meteor.subscribe('user');
  const loadingTeam = !teamSubscription.ready();
  const loadingUser = !userSubscription.ready();
  const team = Teams.findOne({id: currentUser ? currentUser.profile.auth.team_id : ''}) || null;
  
  return {
    currentUser: currentUser,
    loadingUser: loadingUser,
    team: team,
    loadingTeam: loadingTeam
  };
}, SlackSettings);

export default withStyles(styles)(SlackSettingsContainer);