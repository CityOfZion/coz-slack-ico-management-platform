import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import Typography from 'material-ui/Typography';

import {
  SortingState,
  LocalSorting,
  PagingState,
  FilteringState,
  LocalFiltering,
  LocalPaging,
} from '@devexpress/dx-react-grid';

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
    
    this.state = {
      loading: true
    };
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
    
    if(!props.loadingBanned && props.banned) {
      this.parseUsers(props.banned);
    }
  }
  
  render() {
    const {classes} = this.props;
    
    return (
      <div className={classes.main}>
        <Typography className={classes.title} type="headline" component="h3">
          Donate
        </Typography>
        <Typography className={classes.content} type="body1" component="p">
          This system is completely Open Source and free to use. Of course we appreciate it if it's users are willing to donate to us for developing it.
        </Typography>
        <Typography className={classes.content} type="body1" component="p">
          Any donation is more than welcome:<br />
          BTC: 16EB1e16h149B2hud3jQT9BGWA85K4kH1t <br />
          ETH: 0x5ba129171a322ec08be67983a46e2b3140e44d5f <br />
          NEO: AR3HZKcyjQg6iCKSWaUQniVX1ThX8rqeMD
        </Typography>
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
  
  const loadingTeam = !teamSubscription.ready();
  const loadingUser = !userSubscription.ready();
  
  const team = Teams.findOne({id: currentUser ? currentUser.profile.auth.team_id : ''}) || null;
  
  return {
    currentUser: currentUser,
    loadingUser: loadingUser,
    team: team,
    loadingTeam: loadingTeam,
  };
}, Donation);

export default withStyles(styles)(DonationContainer);