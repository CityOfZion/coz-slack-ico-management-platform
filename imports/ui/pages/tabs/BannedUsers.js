import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button'

import {
  SortingState,
  LocalSorting,
  PagingState,
  FilteringState,
  LocalFiltering,
  LocalPaging,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  TableView,
  TableHeaderRow,
  PagingPanel,
  TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';

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
  content: {
    padding: '1vw'
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

class BannedUsers extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      columns: [
        { name: 'userId', title: 'UserID' },
        { name: 'date', title: 'Date' },
        { name: 'email', title: 'Email' },
        { name: 'realName', title: 'Real Name' },
        { name: 'name', title: 'Name' },
        { name: 'displayName', title: 'Display Name' },
        { name: 'byUser', title: 'By User' },
        { name: 'action', title: 'Action' },
      ],
      rows: [],
      totalCount: 0,
      sorting: [{ columnName: 'name', direction: 'asc' }],
      filters: [],
      allowedPageSizes: [5, 10, 15, 0],
      loading: true
    };
  }
  
  changeSorting = sorting => this.setState({ sorting });
  
  componentDidMount() {
    this.checkSubs(this.props);
  }
  
  changeCurrentPage = currentPage => this.setState({loading: true, currentPage,});
  
  changeFilters = filters => this.setState({ filters });
  
  unBan = (userId, username) => {
    Meteor.call('enableUser', userId, username, (err, res) => {
      console.log(err, res);
    })
  };
  
  parseUsers(users) {
    if(users.length > 0) {
      const rows = [];
      const dateFormat = require('dateformat');
  
      users.forEach(user => {
        const row = {
          userId: user.user.id,
          email: user.user.profile.email,
          date: dateFormat(user.banDate.toString(), 'yyyy-mm-dd hh:mm'),
          realName: user.user.profile.real_name,
          name: user.user.name,
          displayName: user.user.profile.display_name,
          byUser: user.byUser,
          action: <Button raised className="button-primary" onClick={e => this.unBan(user.user.id, user.user.name)}>UNBAN</Button>
        };
        
        rows.push(row);
      });
      
      this.setState({rows: rows, totalCount: rows.length});
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.loadingUser !== this.props.loadingUser) this.checkSubs(nextProps);
    if(nextProps.loadingTeam !== this.props.loadingTeam) this.checkSubs(nextProps);
    if(nextProps.loadingBanned !== this.props.loadingBanned) this.checkSubs(nextProps);
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
    const { rows, columns, allowedPageSizes } = this.state;
    
    return (
      <div className={classes.main}>
          <Typography className={classes.title} type="headline" component="h3">
            User Management
          </Typography>
          <Grid
            rows={rows}
            columns={columns}>
            <FilteringState
              filters={this.state.filters}
              onFiltersChange={this.changeFilters}
            />
            <LocalFiltering />
            <SortingState
              sorting={this.state.sorting}
              onSortingChange={this.changeSorting}
            />
            <LocalSorting />
  
            <PagingState
              defaultCurrentPage={0}
              defaultPageSize={5}
            />
            <LocalPaging />
  
            <TableView />
            <TableFilterRow />
            <TableHeaderRow allowSorting/>
            <PagingPanel
              allowedPageSizes={allowedPageSizes}
            />
          </Grid>
      </div>
    );
  }
}

BannedUsers.propTypes = {
  classes: PropTypes.object.isRequired,
};

const BannedUsersContainer = createContainer(() => {
  const currentUser = Meteor.user();
  const teamSubscription = Meteor.subscribe('getTeam');
  const userSubscription = Meteor.subscribe('user');
  const bannedSubscription = Meteor.subscribe('banned');
  
  const loadingTeam = !teamSubscription.ready();
  const loadingBanned = !bannedSubscription.ready();
  const loadingUser = !userSubscription.ready();
  
  const team = Teams.findOne({id: currentUser ? currentUser.profile.auth.team_id : ''}) || null;
  const banned = Banned.find({});
  const bannedCount = banned.count();
  const bannedFetch = banned.fetch();
  
  return {
    currentUser: currentUser,
    loadingUser: loadingUser,
    loadingBanned: loadingBanned,
    team: team,
    loadingTeam: loadingTeam,
    banned: bannedFetch,
    bannedCount: bannedCount
  };
}, BannedUsers);

export default withStyles(styles)(BannedUsersContainer);