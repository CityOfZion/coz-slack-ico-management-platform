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
import {MenuItem} from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Input, {InputLabel} from 'material-ui/Input';

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

class UserInvitePage extends Component {
  
  constructor(props) {
    super(props);
  }
  
  componentDidMount() {
    this.checkSubs(this.props);
  }
  
  componentWillReceiveProps(nextProps) {
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
        <Typography className={classes.title} type="headline" component="h3">
          Request invitation
        </Typography>
        <Paper className={classes.paper} elevation={3}>
          <FormControl className={classes.formControl} component="fieldset">
            <FormLabel className={classes.label}>This lets you specify if you want to use this system to manage your invites.</FormLabel>
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
  const team = Teams.findOne({id: Router.current().params.teamId}) || null;
  
  console.log(team);
  
  return {
    team: team,
    loadingTeam: loadingTeam
  };
}, UserInvitePage);

export default withStyles(styles)(UserInvitePageContainer);