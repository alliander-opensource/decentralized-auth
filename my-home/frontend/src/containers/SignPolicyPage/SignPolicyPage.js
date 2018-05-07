import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { history as historyPropTypes } from 'history-prop-types';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import axios from 'axios';
import uuidv4 from 'uuid';

import SignPolicy from '../SignPolicy/SignPolicy';

// TODO: move?
function generateId() {
  // TODO: let this be done by sp?
  return uuidv4();
}

// TODO: move?
function addPolicy(policy, signature, serviceProvider) {
  const transactionHash = generateId();
  const body = {
    transactionHash,
    serviceProvider,
    policy,
    signature,
  };
  const options = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  return axios
    .post('/api/policy/new', body, options)
    .then(response => response.data);
}

class SignPolicyPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signPolicyCompleted: false,
      signPolicyFailed: false,
      attributesForSigning: [{
        label: 'Address',
        attributes: ['pbdf.pbdf.idin.address'],
      },
      {
        label: 'City',
        attributes: ['pbdf.pbdf.idin.city'],
      }],
    };
  }

  componentDidMount() {
    // this._isMounted = true;
    // if (!this.state.sessionStarted) {
    this.fetchMessage();
    // }
  }

  componentDidUpdate() {
    if (this.state.signPolicyCompleted) {
      this.props.history.push('/my-policies');
    }
  }

  onSigningComplete = (result) => {
    console.log('Succes: ', result); // eslint-disable-line no-console
    addPolicy(this.state.policy, { ...result }, this.getServiceProvider())
      .then(() => {
        this.setState({
          signPolicyCompleted: true,
        });
      })
      .catch(() => {
        this.setState({
          signPolicyFailed: true,
        });
      });
  };

  onSigningFailure = (result) => {
    console.log('Error: ', result); // eslint-disable-line no-console
  };

  getServiceProvider = () =>
    queryString.parse(this.props.location.search)['spId']; // eslint-disable-line

  fetchMessage = () => {
    const actorId = this.getServiceProvider();
    const policy = {
      actorId,
      action: 'lezen',
      actee: 'mijn inkomensgegevens',
      conditions: [],
      goal: 'om mijn financien te regelen.',
    };
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    axios
      .post('/api/policy/get-message-for-policy', policy, options)
      .then(response => response.data)
      .then((data) => {
        // if (this._isMounted) {
        this.setState({
          message: data.message,
          policy,
        });
        // }
      });
  }

  render() {
    const {
      message,
      attributesForSigning,
      signPolicyCompleted,
      signPolicyFailed,
    } = this.state;

    if (signPolicyCompleted) {
      return (
        'Toestemming ingesteld! Je wordt nu doorgestuurd...'
      );
    }

    if (signPolicyFailed) {
      return (
        'Er ging iets mis met het instellen van toestemmingen...'
      );
    }

    return message ? (
      <SignPolicy
        requiredAttributes={attributesForSigning}
        message={message}
        onComplete={this.onSigningComplete}
        onFailure={this.onSigningFailure}
      />
    ) : 'Toestemmingverzoek wordt aangemaakt...';
  }
}

SignPolicyPage.propTypes = {
  history: PropTypes.shape(historyPropTypes),
};

export default withRouter(SignPolicyPage);
