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
import {createContainer} from 'meteor/react-meteor-data';

const styles = theme => ({
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1vh',
    flexDirection: 'column'
    
  },
  warning: {
    fontWeight: 'bold',
    fontSize: '1.1em'
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
    width: '90%',
    paddingLeft: '2vw',
    paddingRight: '2vw',
    marginBottom: '1vh'
  }
});

class NormalBotSettings extends Component {
  
  constructor(props) {
    super(props);
    
    this.standardPriceBotConfig = {
      coin: '',
      currency: 'USD',
      channel: '',
      interval: 5,
      inTopic: true
    };
    
    this.state = {
      enablePriceAnnouncements: false,
      priceBots: [],
      priceChecks: {},
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
  
  checkPriceUrl = index => {
    Meteor.call('isValidPriceUrl', this.state.priceBots[index].coin, this.state.priceBots[index].currency, (err, res) => {
      console.log(err, res);
      const priceChecks = this.state.priceChecks;
      if(res.error) priceChecks[index] = res.error;
      else priceChecks[index] = res;
      
      this.setState({priceChecks: priceChecks});
    });
  };
  
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
  
  priceAnnouncementsChannel = index => {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Specify a channel where price announcements will be sent. This has to be the Channel ID (C1234567 or similar)</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in a channel"
            value={this.state.priceBots[index].channel || ''}
            margin="normal"
            fullWidth={true}
            onChange={event => {
              const bots = this.state.priceBots;
              bots[index].channel = event.target.value;
              this.setState({priceBots: bots});
            }}
          />
        </div>
      </FormControl>
    );
  };
  
  priceAnnouncementsCoin = index => {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Specify which coin will be used.</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in a coin"
            value={this.state.priceBots[index].coin || ''}
            margin="normal"
            fullWidth={true}
            onChange={event => {
              const bots = this.state.priceBots;
              bots[index].coin = event.target.value;
              this.setState({priceBots: bots});
            }}
          />
        </div>
      </FormControl>
    );
  };
  
  priceAnnouncementsCurrency = index => {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Specify which currency will be used.</FormLabel>
        <div className={classes.row}>
          <TextField
            label="Fill in a currency"
            value={this.state.priceBots[index].currency || 'USD'}
            margin="normal"
            fullWidth={true}
            onChange={event => {
              const bots = this.state.priceBots;
              bots[index].currency = event.target.value;
              this.setState({priceBots: bots});
            }}
          />
        </div>
      </FormControl>
    );
  };
  
  priceAnnouncementsInterval = index =>  {
    const {classes} = this.props;
    return <FormControl className={classes.formControl} component="fieldset">
      <FormLabel className={classes.label}>Which interval in <strong>minutes</strong> should the bot announce at?</FormLabel>
      <TextField
        label="Fill in an interval"
        value={this.state.priceBots[index].interval}
        type="number"
        margin="normal"
        fullWidth={true}
        onChange={event => {
          const bots = this.state.priceBots;
          bots[index].interval = event.target.value;
          this.setState({priceBots: bots});
        }}
      />
    </FormControl>
  };
  
  priceAnnouncementInTopic = index =>  {
    const {classes} = this.props;
    return (
      <FormControl className={classes.formControl} component="fieldset">
        <FormLabel className={classes.label}>Set the price announcement as the topic of the channel, else will post a message instead</FormLabel>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.priceBots[index].inTopic}
              onChange={(event, checked) => this.setState({priceAnnouncementInTopic: checked})}
            />
          }
          label={this.state.priceAnnouncementInTopic ? "Enabled" : "Disabled"}
        />
      </FormControl>
    )
  };
  
  saveSettings = () => {
   
    this.setState({saving: true});
    const data = {...this.state};
    
    delete data.saving;
    delete data.priceChecks;
    
    Meteor.call('saveSettings', data, (err, res) => {
      Meteor.setTimeout(() => this.setState({saving: false}), 5000);
    });
  };
  
  priceBots() {
    const {classes} = this.props;
    const output = [];
  
    if(this.state.priceBots.length > 0) {
      this.state.priceBots.forEach((bot, index) => {
        output.push(
          <Paper className={classes.paper} elevation={3} key={index}>
            <Typography className={classes.title} type="headline" component="h4">
              Bot {index + 1}
            </Typography>
            <Typography className={classes.warning} type="body1" component="p">
              <Button raised className="button-info" onClick={e => this.checkPriceUrl(index)}>
                Check coin/currency pair validity
              </Button>
              <br />
              {this.state.priceChecks[index] === true ? 'This combination is valid' : this.state.priceChecks[index]}
            </Typography>
            {this.priceAnnouncementsCoin(index)}
            {this.priceAnnouncementsCurrency(index)}
            {this.priceAnnouncementsChannel(index)}
            {this.priceAnnouncementsInterval(index)}
            {this.priceAnnouncementInTopic(index)}
            <Button raised className="button-danger" onClick={e => {
              const bots = this.state.priceBots;
              bots.splice(index);
              this.setState({priceBots: bots});
            }}>
              Delete this bot
            </Button>
          </Paper>
        )
      })
    }
    
    return output;
  }
  
  render() {
    const {classes} = this.props;
    return (
      <div className={classes.main}>
        <Typography className={classes.title} type="headline" component="h3">
          Price Bot Settings
        </Typography>
        
        <Paper className={classes.paper} elevation={3}>
          {this.enablePriceAnnouncements()}
        </Paper>
        
        {this.state.enablePriceAnnouncements ?
          this.priceBots() : ''}
        {this.state.enablePriceAnnouncements ?
          <Button raised className="button-warning" onClick={e => {
            const bots = this.state.priceBots;
            bots.push(this.standardPriceBotConfig);
            this.setState({priceBots: bots});
          }}>
            Add a price bot
          </Button> : '' }
        
        {this.state.saving ?
          <Button raised className="button-success" >
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