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
    alignItems: 'center',
    marginBottom: '1vh'
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

class BotSettings extends Component {
  
  constructor(props) {
    super(props);
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
  
  render() {
    const {classes} = this.props;
    return (
      <div className={classes.main}>
        <Paper className={classes.root} elevation={3}>
          <Typography className={classes.title} type="headline" component="h3">
            User Management
          </Typography>
          <Paper className={classes.paper} elevation={3}>
            Coming soon
          </Paper>
        </Paper>
      </div>
    );
  }
}

BotSettings.propTypes = {
  classes: PropTypes.object.isRequired,
};

const BotSettingsContainer = createContainer(() => {
  const currentUser = Meteor.user();
  const teamSubscription = Meteor.subscribe('getTeam');
  const userSubscription = Meteor.subscribe('user');
  const bannedSubscription = Meteor.subscribe('banned');
  const loadingTeam = !teamSubscription.ready();
  const loadingBanned = !bannedSubscription.ready();
  const loadingUser = !userSubscription.ready();
  const team = Teams.findOne({id: currentUser ? currentUser.profile.auth.team_id : ''}) || null;
  const banned = Banned.find({}).fetch();
  
  return {
    currentUser: currentUser,
    loadingUser: loadingUser,
    loadingBanned: loadingBanned,
    team: team,
    loadingTeam: loadingTeam,
    banned: banned
  };
}, BotSettings);

export default withStyles(styles)(BotSettingsContainer);