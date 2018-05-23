import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid';
import Moment from 'react-moment';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import uuid from 'uuid';

import { getPolicies, deletePolicy } from '../../actions';

class MyPolicies extends Component {
  componentDidMount() {
    this.props.getPolicies();
  }

  render() {
    const { policies } = this.props;

    const policyContainerStyle = {
      padding: '10px',
      backgroundColor: '#b3f0ff',
      marginBottom: '10px',
    };

    return (
      <div style={{ padding: '20px' }} id="my-policies-page">
        <Row>
          <Col xs={8}>
            <h2>My Policies</h2>
          </Col>
        </Row>

        { policies.isFetching ? <CircularProgress /> : (
          <div>
            {
              policies.policies.length === 0 ? (
                <Row>
                  No policies yet.
                  Go to a service provider - we only know of&nbsp;
                  <a href="http://www.wattt.nl">Wattt P1 Insights</a> -
                  to request access.
                </Row>
              ) :
                policies.policies.map(policy => (
                  <div key={uuid()} style={policyContainerStyle}>
                    <Row>
                      <Col xs={1} sm={2} md={2} lg={2}>
                        <strong>
                          { policy.serviceProvider.url }
                        </strong>
                      </Col>
                      <Col xs={1} sm={2} md={2} lg={2}>
                        (Iota address: { policy.serviceProvider.iotaAddress })
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={11} sm={10} md={10} lg={10}>
                        <i>is allowed to</i> {policy.action} <i>to</i> { policy.goal }
                      </Col>
                    </Row>
                    <br />
                    <Row>
                      <Col xs={12} style={{ textAlign: 'right' }}>
                        <RaisedButton
                          onClick={() => this.props.deletePolicy(policy)}
                          label="Revoke"
                          primary
                          disabled={policy.isDeleting}
                          style={{}}
                        />
                      </Col>
                    </Row>
                  </div>
                ))
            }
          </div>
        )}
        <br />
        <br />
      </div>
    );
  }
}

MyPolicies.propTypes = {
  getPolicies: PropTypes.func.isRequired,
  deletePolicy: PropTypes.func.isRequired,
  policies: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

function mapStateToProps(state) {
  const { policies } = state;
  return {
    policies,
  };
}

const mapDispatchToProps = {
  getPolicies,
  deletePolicy,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MyPolicies));
