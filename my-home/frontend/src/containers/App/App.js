import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import IconSocialPerson from 'material-ui/svg-icons/social/person';
import MenuItem from 'material-ui/MenuItem';
import { Grid, Row, Col } from 'react-flexbox-grid';

import SideMenu from '../../components/SideMenu/SideMenu';

import Home from '../../containers/Home/Home';
import MyPolicies from '../../containers/MyPolicies/MyPolicies';
import MyDevices from '../../containers/MyDevices/MyDevices';
import UserInfo from '../../containers/UserInfo/UserInfo';
import NewPolicyPage from '../NewPolicyPage/NewPolicyPage';
import NewDevicePage from '../NewDevicePage/NewDevicePage';

import { deauthenticate } from '../../actions';

import './App.css';

const styles = {
  main: {
    minHeight: 200,
    margin: 20,
  },
};

class App extends Component {
  handleDeauth() {
    const { dispatch } = this.props;
    dispatch(deauthenticate());
  }

  render() {
    const RightMenu = props => (
      <IconMenu
        id="user-menu"
        {...props}
        iconButtonElement={
          <IconButton id="navbar-user-icon">
            <IconSocialPerson style={{ color: 'red' }} />
          </IconButton>
        }
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Link to="/">
          <MenuItem primaryText="About" />
        </Link>
        <MenuItem
          primaryText="Clear session"
          id="deauthenticate-button"
          onClick={() => this.handleDeauth()}
        />
      </IconMenu>
    );

    return (
      <BrowserRouter>
        <div>
          <AppBar
            title={<Link to="/" style={{ color: 'white' }}>My Home</Link>}
            iconElementRight={<RightMenu />}
          />
          <Grid fluid>
            <Row>
              <Col xs={12} sm={3}>
                <SideMenu />
              </Col>

              <Col xs>
                <Paper style={styles.main} id="main-content">
                  <Route exact path="/" component={Home} />
                  <Route path="/my-devices" component={MyDevices} />
                  <Route path="/new-device" component={NewDevicePage} />
                  <Route path="/my-policies" component={MyPolicies} />
                  <Route path="/new-policy" component={NewPolicyPage} />
                </Paper>
              </Col>

              <Col xs={12} sm={3}>
                <UserInfo />
              </Col>
            </Row>
          </Grid>
        </div>
      </BrowserRouter>
    );
  }
}

App.propTypes = {
  dispatch: PropTypes.func,
};

export default connect()(App);
