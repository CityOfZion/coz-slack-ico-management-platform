import React, {Component} from 'react';
import Button from 'material-ui/Button'
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';


const styles = theme => ({
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
  root: theme.mixins.gutters({
    width: '50vw',
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    textAlign: 'center'
  }),
  title: {
    textAlign: 'center'
  },
  content: {
    textAlign: 'center'
  }
});

class MainDashboardLogin extends Component {
  render() {
    const {classes, title} = this.props;
    return (
      <div className={classes.main}>
        <Paper className={classes.root} elevation={2}>
          <Typography className={classes.title} type="headline" component="h3">
            You are an admin
          </Typography>
          <Typography className={classes.content} type="body1" component="p">
            We've noticed you are an admin on the slack you registered, this means you have access to the settings and management dashboard.
            Click the button below to enter it.
          </Typography>
          <Button raised href="/dashboard" className="button-primary">
            Go to the admin dashboard
          </Button>
        </Paper>
      </div>
    );
  }
}

MainDashboardLogin.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MainDashboardLogin);