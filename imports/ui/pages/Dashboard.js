import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import BannedUsers from '/imports/ui/pages/tabs/BannedUsers';
import BotSettings from '/imports/ui/pages/tabs/BotSettings';

function TabContainer(props) {
  return <div style={{ padding: 20 }}>{props.children}</div>;
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  main: {
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
  button: {
    margin: theme.spacing.unit,
  },
  root: {
    flexGrow: 1,
    width: '50vw',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    textAlign: 'center',
    marginBottom: '1vh'
  },
});

class Dashboard extends React.Component {
  state = {
    value: 0,
  };
  
  handleChange = (event, value) => {
    this.setState({ value });
  };
  
  render() {
    const { classes } = this.props;
    const { value } = this.state;
    
    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange}>
            <Tab label="Bot Settings" />
            <Tab label="User management" />
          </Tabs>
        </AppBar>
        {value === 0 && <TabContainer><BotSettings /></TabContainer>}
        {value === 1 && <TabContainer><BannedUsers /></TabContainer>}
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);