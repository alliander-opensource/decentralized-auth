import React, { Component } from 'react';
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

class SignPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureStatus: 'PENDING',
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

  componentWillUnmount() {
    this._isMounted = false; // eslint-disable-line no-underscore-dangle
    this.stopPolling();
  }

  getSignatureStatus(irmaSessionId) { // eslint-disable-line class-methods-use-this
    return axios
      .get(`/api/signature-status?irmaSessionId=${irmaSessionId}`, {
        withCredentials: true,
      })
      .then(response => response.data);
  }

  fetchQR = () => {
    const { requiredAttributes, message } = this.props;
    this.setState({
      signatureStatus: 'PENDING',
      serverStatus: 'INITIALIZED',
      sessionStarted: true,
    });
    axios
      .post('/api/start-irma-session', {
        content: requiredAttributes,
        message,
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

  startPolling = (irmaSessionId) => {
    const pollTimerId = setInterval(() => this.poll(), 1000, irmaSessionId);
    this.setState({ pollTimerId });
  }

  stopPolling = () => {
    if (this.state.pollTimerId) {
      clearInterval(this.state.pollTimerId);
      this.setState({ pollTimerId: undefined });
    }
  }

  poll(irmaSessionId) {
    this
      .getSignatureStatus(irmaSessionId)
      .then((result) => {
        this.setState({
          signatureStatus: result.signatureStatus,
          serverStatus: result.serverStatus,
          proofStatus: result.proofStatus,
        });
        switch (result.signatureStatus) {
          case 'COMPLETED':
            this.stopPolling();
            this.props.onComplete(result);
            break;
          case 'ABORTED':
            this.props.onFailure(result);
            this.stopPolling();
            break;
          default:
            break;
        }
      });
  }

  render() {
    const { requiredAttributes, message } = this.props;
    const {
      qrContent,
      signatureStatus,
      proofStatus,
      serverStatus,
    } = this.state;

    return (
      <div>
        {qrContent ? (
          <div>

            {(signatureStatus === 'PENDING') && (
              <div>

                <Toolbar style={{ backgroundColor: 'none' }}>
                  <ToolbarGroup>
                    <ToolbarTitle text="Toestemming instellen" />
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
                        Toestemming: {message}
                        <br />
                        Ondertekenen met: <br />
                        <b>{requiredAttributes.map(el => el.label).join(', ')}</b><br />
                        <br />
                      </Col>
                    </Row>
                    <Row center="xs">
                      <Col xs>
                        <QRCode value={JSON.stringify(qrContent)} size={256} />
                        <br />
                        <span
                          style={{ display: 'none' }}
                          id="qr-content"
                        >
                          {JSON.stringify(qrContent)}
                        </span>
                        <br />
                      </Col>
                    </Row>
                    <Row center="xs">
                      <Col xs={6}>
                        Scan de QR-code met de IRMA app om de toestemming te ondertekenen.
                        <br />
                      </Col>
                    </Row>
                  </div>
                )}

                {(serverStatus === 'CONNECTED') && (
                  <div style={{ padding: '20px' }} id="qr-scanned">
                    <Row center="xs">
                      <Col xs={6}>
                        Om verder te gaan, onderteken het bericht in IRMA-app.
                        <br />
                        <br />
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            )}

            {(signatureStatus === 'COMPLETED') && (
              <div>
                {(proofStatus === 'VALID') ? (
                  <div id="signature-proof-completed">
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
                        Toestemming succesvol ingesteld!
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <div id="signature-error">
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
                        Er is iets misgegaan!
                        <br />
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
            {(signatureStatus === 'ABORTED') && (
              <div>
                <Toolbar style={{ backgroundColor: 'none' }}>
                  <ToolbarGroup>
                    <ToolbarTitle text="Toestemming instellen geannuleerd" />
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
                  <div style={{ padding: '20px' }} id="signature-cancelled">
                    <Row center="xs">
                      <Col xs={6}>
                        Je hebt het toestemming instellen geannuleerd.
                        <br />
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
                        De QR code is verlopen.
                        <br />
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

SignPolicy.propTypes = {
  requiredAttributes: PropTypes.arrayOf(PropTypes.object).isRequired,
  message: PropTypes.string.isRequired, // TODO: include entire policy
  onComplete: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default SignPolicy;
