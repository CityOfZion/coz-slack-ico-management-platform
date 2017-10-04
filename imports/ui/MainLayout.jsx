import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  container: {
    border: '2vh solid #2B2B5E',
    background: 'url(/images/Background-texture.jpg) 0 0 no-repeat',
    backgroundSize: 'cover',
    padding: '0 2vw',
    minHeight: '96vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  root: {
    marginTop: theme.spacing.unit * 3
  },
  subtitle: {
    fontSize: '1.3em',
    fontWeight: '400',
    color: '#FFD84B',
    marginBottom: '15px'
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  cozLogo: {
    marginTop: '3vh',
    width: '25vw'
  }
});

class MainLayout extends Component {
  render() {
    const {classes, content} = this.props;
  
    return (
      <div className={classes.container}>
        <div style={{order: 1, textAlign: 'center'}} >
        <img src="/images/Coz-logo.svg" alt="City of Zion" className={classes.cozLogo} />
          <p className={classes.subtitle}>A Slack solution against Spam and Scam!</p>
        </div>
        <div style={{order: 2, textAlign: 'center'}}>
        {content}
        </div>
      </div>
    );
  }
}
export default withStyles(styles)(MainLayout);