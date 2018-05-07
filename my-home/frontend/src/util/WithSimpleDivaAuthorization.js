import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import RequestAttributeDisclosure from '../containers/RequestAttributeDisclosure/RequestAttributeDisclosure';

/**
 * HOC that Handles whether or not the user is allowed to see the page.
 * @param {array} requiredAttribute - user attribute that is required to see the page.
 * @returns {Component}
 */
export default function WithSimpleDivaAuthorization(requiredAttribute) {
  return (WrappedComponent) => {
    class WithSimpleAuthorization extends Component {
      static propTypes = {
        user: PropTypes.shape({
          isFetching: PropTypes.bool.isRequired,
          sessionId: PropTypes.string.isRequired,
          attributes: PropTypes.objectOf(PropTypes.array).isRequired,
        }),
      };

      constructor(props) {
        super(props);
        this.content = [{
          label: requiredAttribute,
          attributes: [requiredAttribute],
        }];
      }

      render() {
        const { user } = this.props;
        if (user.attributes[requiredAttribute]) {
          return <WrappedComponent {...this.props} />;
        }
        return <RequestAttributeDisclosure requiredAttributes={this.content} />;
      }
    }
    return connect(state => ({ user: state.user }))(WithSimpleAuthorization);
  };
}
