import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { Row, Col } from 'react-flexbox-grid';
import axios from 'axios';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import IconActionCheckCircle from 'material-ui/svg-icons/action/check-circle';
import IconActionHelp from 'material-ui/svg-icons/action/help';
import IconActionInfo from 'material-ui/svg-icons/action/info';
import IconAlertError from 'material-ui/svg-icons/alert/error';

import IconButton from 'material-ui/IconButton';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';

import { fetchSession } from '../../actions';

class RequestAttributeDisclosure extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disclosureStatus: 'PENDING',
      serverStatus: 'INITIALIZED',
      sessionStarted: false,
    };
  }

  componentDidMount() {
    this._isMounted = true; // eslint-disable-line no-underscore-dangle
    if (!this.state.sessionStarted) {
      this.fetchQR();
    }
  }

  getDisclosureStatus(irmaSessionId) { // eslint-disable-line class-methods-use-this
    return axios
      .get(`/api/disclosure-status?irmaSessionId=${irmaSessionId}`, {
        withCredentials: true,
      })
      .then(response => response.data);
  }

  fetchQR = () => {
    const { requiredAttributes } = this.props;
    this.setState({
      disclosureStatus: 'PENDING',
      serverStatus: 'INITIALIZED',
      sessionStarted: true,
    });
    axios
      .post('/api/start-irma-session', {
        content: requiredAttributes,
      }, {
        withCredentials: true,
      })
      .then(response => response.data);
  }

  startPolling = (irmaSessionId) => {
    const pollTimerId = setInterval(() => this.poll(irmaSessionId), 1000);
    this.setState({ pollTimerId });
  }

  stopPolling = () => {
    if (this.state.pollTimerId) {
      clearInterval(this.state.pollTimerId);
      this.setState({ pollTimerId: undefined });
    }
  }

  fetchQR = () => {
    const { requiredAttributes } = this.props;
    this.setState({
      disclosureStatus: 'PENDING',
      serverStatus: 'INITIALIZED',
      sessionStarted: true,
    });
    axios
      .post('/api/start-irma-session', {
        content: requiredAttributes,
      }, {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.data)
      .then((data) => {
        if (this._isMounted) { // eslint-disable-line no-underscore-dangle
          this.setState({
            qrContent: data.qrContent,
          });
          this.startPolling(data.irmaSessionId);
        }
      });
  }

  poll(irmaSessionId) {
    this
      .getDisclosureStatus(irmaSessionId)
      .then((result) => {
        console.log(result); // eslint-disable-line no-console
        this.setState({
          disclosureStatus: result.disclosureStatus,
          serverStatus: result.serverStatus,
          proofStatus: result.proofStatus,
        });
        switch (result.disclosureStatus) {
          case 'COMPLETED':
            setTimeout(() => { this.refreshSession(); }, 2000);
            this.stopPolling();
            break;
          case 'ABORTED':
            this.stopPolling();
            break;
          default:
            break;
        }
      });
  }

  refreshSession() {
    this.props.dispatch(fetchSession());
  }

  render() {
    const { requiredAttributes } = this.props;
    const {
      qrContent,
      disclosureStatus,
      proofStatus,
      serverStatus,
    } = this.state;

    return (
      <div>
        {qrContent ? (
          <div>

            {(disclosureStatus === 'PENDING') && (
              <div>

                <Toolbar style={{ backgroundColor: 'none' }}>
                  <ToolbarGroup>
                    <ToolbarTitle text="Attribute Required" />
                  </ToolbarGroup>
                  <ToolbarGroup lastChild>
                    <IconButton tooltip="Help">
                      <IconActionHelp />
                    </IconButton>
                    <IconButton tooltip="Info">
                      <IconActionInfo />
                    </IconButton>
                  </ToolbarGroup>
                </Toolbar>

                {(serverStatus === 'INITIALIZED') && (
                  <div style={{ padding: '20px' }}>
                    <Row center="xs">
                      <Col xs={6}>
                        In order to view this page, the following attributes are required:<br />
                        <br />
                        <b>{requiredAttributes.map(el => el.label).join(', ')}</b><br />
                        <br />
                      </Col>
                    </Row>
                    <Row center="xs">
                      <Col xs>
                        <QRCode value={JSON.stringify(qrContent)} size={256} /><br />
                        <span style={{ display: 'none' }} id="qr-content">{JSON.stringify(qrContent)}</span>
                        <br />
                      </Col>
                    </Row>
                    <Row center="xs">
                      <Col xs={6}>
                        Please scan the QR code with your IRMA app to continue.
                        <br />
                      </Col>
                    </Row>
                  </div>
                )}

                {(serverStatus === 'CONNECTED') && (
                  <div style={{ padding: '20px' }} id="qr-scanned">
                    <Row center="xs">
                      <Col xs={6}>
                        To continue, approve attribute disclosure with your IRMA app.<br />
                        <br />
                      </Col>
                    </Row>
                  </div>
                )}

              </div>
            )}

            {(disclosureStatus === 'COMPLETED') && (
              <div>
                {(proofStatus === 'VALID') ? (
                  <div id="disclosure-proof-completed">
                    <Row center="xs">
                      <Col xs>
                        <IconActionCheckCircle style={{
                          width: '100px',
                          height: '100px',
                          color: 'limegreen',
                        }}
                        />
                      </Col>
                    </Row>
                    <Row center="xs">
                      <Col xs={6}>
                        Attribute disclosure successful!
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <div id="disclosure-error">
                    <Row center="xs">
                      <Col xs>
                        <IconAlertError style={{
                          width: '100px',
                          height: '100px',
                          color: 'orangered',
                        }}
                        />
                      </Col>
                    </Row>
                    <Row center="xs">
                      <Col xs={6}>
                        Oops, something went wrong!<br />
                        <br />
                        <RaisedButton
                          label="Retry"
                          primary
                          style={{}}
                          onClick={() => this.fetchQR()}
                        />
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            )}
            {(disclosureStatus === 'ABORTED') && (
              <div>
                <Toolbar style={{ backgroundColor: 'none' }}>
                  <ToolbarGroup>
                    <ToolbarTitle text="Disclosure cancelled" />
                  </ToolbarGroup>
                  <ToolbarGroup lastChild>
                    <IconButton tooltip="Help">
                      <IconActionHelp />
                    </IconButton>
                    <IconButton tooltip="Info">
                      <IconActionInfo />
                    </IconButton>
                  </ToolbarGroup>
                </Toolbar>

                {(serverStatus === 'CANCELLED') && (
                  <div style={{ padding: '20px' }} id="disclosure-cancelled">
                    <Row center="xs">
                      <Col xs={6}>
                        You cancelled attribute disclosure.<br />
                        <br />
                        <RaisedButton
                          label="Retry"
                          primary
                          style={{}}
                          onClick={() => this.fetchQR()}
                        />
                        <br />
                      </Col>
                    </Row>
                  </div>
                )}

                {(serverStatus === 'NOT_FOUND') && (
                  <div style={{ padding: '20px' }} id="qr-expired">
                    <Row center="xs">
                      <Col xs={6}>
                        The QR code expired.<br />
                        <br />
                        <RaisedButton
                          label="Retry"
                          primary
                          style={{}}
                          onClick={() => this.fetchQR()}
                        />
                        <br />
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <Row center="xs">
              <Col xs>
                <CircularProgress />
              </Col>
            </Row>
          </div>
        )}
      </div>
    );
  }
}

RequestAttributeDisclosure.propTypes = {
  requiredAttributes: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatch: PropTypes.func,
};

export default withRouter(connect()(RequestAttributeDisclosure));
