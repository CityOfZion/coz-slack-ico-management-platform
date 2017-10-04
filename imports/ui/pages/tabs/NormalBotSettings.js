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
    marginBottom: '1vh',
    flexDirection: 'column'
    
  },
  button: {
    margin: theme.spacing.unit,
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
  paper: {
    width: '44vw',
    paddingLeft: '2vw',
    paddingRight: '2vw',
    marginBottom: '1vh'
  }
});

class NormalBotSettings extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      enablePriceAnnouncements: false,
      priceAnnouncementsChannel: '',
      priceAnnouncementsCoin: '',
      priceAnnouncementsInterval: 5,
      priceAnnouncementInTopic: true,
      
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
  
  enablePriceAnnouncements() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Enables price announcements in the specified channel</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.enablePriceAnnouncements}
              onChange={(event, checked) => this.setState({enablePriceAnnouncements: checked})}
            />
          }
          label={this.state.enablePriceAnnouncements ? "Enabled" : "Disabled"}
        />
      </FormControl>
    )
  }
  
  priceAnnouncementsChannel(){
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Specify a channel where price announcements will be sent. This has to be the Channel ID (C1234567 or similar)</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in a channel"
            value={this.state.priceAnnouncementsChannel}
            margin="normal"
            fullWidth={true}
            onChange={event => this.setState({priceAnnouncementsChannel: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  priceAnnouncementsCoin(){
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Specify which coin will be used.<br />
          <strong>https://api.coinmarketcap.com/v1/ticker/{this.state.priceAnnouncementsCoin.length > 0 ? this.state.priceAnnouncementsCoin : "YOUR_COIN"}/?convert=USD</strong>
          <br />should yield a result.</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in a coin"
            value={this.state.priceAnnouncementsCoin}
            margin="normal"
            fullWidth={true}
            onChange={event => this.setState({priceAnnouncementsCoin: event.target.value})}
          />
        </div>
      </FormControl>
    );
  };
  
  priceAnnouncementsInterval() {
    const {classes} = this.props;
    
    const options = () => {
      const map = [];
      for(let i = 1; i < 30; i++) {
        map.push(<MenuItem key={'option' + i} value={i}>{i}</MenuItem>);
      }
      
      return map;
    };
    
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>Which interval in <strong>minutes</strong> should the bot announce at?</FormLabel>
      <Select
        value={this.state.priceAnnouncementsInterval}
        onChange={e => this.setState({priceAnnouncementsInterval: e.target.value})}
        input={<Input id="target-number" />}
      >
        {options()}
      </Select>
    </FormControl>
  }
  
  priceAnnouncementInTopic() {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Set the price announcement as the topic of the channel, else will post a message instead</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.priceAnnouncementInTopic}
              onChange={(event, checked) => this.setState({priceAnnouncementInTopic: checked})}
            />
          }
          label={this.state.priceAnnouncementInTopic ? "Enabled" : "Disabled"}
        />
      </FormControl>
    )
  }
  
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
          General Bot Settings
        </Typography>
        
        <Paper className={classes.paper} elevation={3}>
          {this.enablePriceAnnouncements()}
          {this.state.enablePriceAnnouncements ? this.priceAnnouncementsCoin() : ''}
          {this.state.enablePriceAnnouncements ? this.priceAnnouncementsChannel() : ''}
          {this.state.enablePriceAnnouncements ? this.priceAnnouncementsInterval() : ''}
          {this.state.enablePriceAnnouncements ? this.priceAnnouncementInTopic() : ''}
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
      </div>
    );
  }
}

NormalBotSettings.propTypes = {
  classes: PropTypes.object.isRequired,
};

const NormalBotSettingsContainer = createContainer(() => {
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
}, NormalBotSettings);

export default withStyles(styles)(NormalBotSettingsContainer);