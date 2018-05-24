import React, { Component } from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import PropTypes from 'prop-types';
import { history as historyPropTypes } from 'history-prop-types';
import { Row, Col } from 'react-flexbox-grid';
import RaisedButton from 'material-ui/RaisedButton';
import { connect } from 'react-redux';
import { addDevice } from '../../actions';

class NewDevicePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      iotaAddress: 'FODEYEQHYCWYTDEDWZLPCLRDIU9RFKU9AFQSEOR9RSGEPDGQBGMYXIQCENBDGYFFS9AJK9GJJZJGEUEW9',
      secret: '',
    };

    // Prevent ECMAscript not binding this (which we need for setState)
    // See https://stackoverflow.com/a/43644649/2609980
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onSecretChange = this.onSecretChange.bind(this);
  }

  componentDidMount() {
    this._isMounted = true; // eslint-disable-line no-underscore-dangle
  }

  componentWillReceiveProps(nextProps) {
    // When device is received move to new page
    if (this.props.isFetching && !nextProps.isFetching) {
      this.props.history.push('/my-devices');
      window.location.reload();
    }
  }

  componentWillUnmount() {
    this._isMounted = false; // eslint-disable-line no-underscore-dangle
  }

  onAddressChange(event) {
    this.setState({ iotaAddress: event.target.value });
  }

  onSecretChange(event) {
    this.setState({ secret: event.target.value });
  }

  render() {
    const { dispatch } = this.props;
    const { iotaAddress, secret } = this.state;
    return this.props.isFetching ?
      (
        <div style={{ padding: '20px' }} id="my-devices-page">
          <Row>
            <Col xs={8}>
              <h2>Pairing with device...</h2>
            </Col>
          </Row>
          <Row>
            <Col xs={8}>
              <CircularProgress />
            </Col>
          </Row>
          <Row>
            <Col xs={8}>
              <span>
                Pairing device via the IOTA Tangle.
                Please wait.
                Sending messages back and forth can take up to three minutes!
              </span>
            </Col>
          </Row>

        </div>
      )
      : (
        <div style={{ padding: '20px' }} id="my-devices-page">
          <Row>
            <Col xs={8}>
              <h2>Add New Device</h2>
            </Col>
          </Row>
          <Row>
            <Col xs={8}>
              Raspberry Pi&#39;s IOTA address: &nbsp;
              <input
                type="text"
                value={iotaAddress}
                onChange={this.onAddressChange}
              />
            </Col>
            <Col xs={4} style={{ textAlign: 'right' }}>
              <RaisedButton
                onClick={() => dispatch(addDevice(iotaAddress, secret))}
                label="Claim Raspberry Pi"
                primary
                style={{}}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={8}>
              Secret on device: &nbsp;
              <input
                type="text"
                value={secret}
                onChange={this.onSecretChange}
              />
            </Col>
          </Row>
        </div>
      );
  }
}

NewDevicePage.propTypes = {
  history: PropTypes.shape(historyPropTypes),
  isFetching: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const { device: { isFetching } } = state;
  return { isFetching };
}

export default connect(mapStateToProps)(NewDevicePage);
