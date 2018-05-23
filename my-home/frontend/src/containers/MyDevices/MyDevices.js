import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { history as historyPropTypes } from 'history-prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid';
import Moment from 'react-moment';
import 'moment/locale/nl';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';

import { getDevices, deleteDevice } from '../../actions';

class MyDevices extends Component {
  componentDidMount() {
    this.props.getDevices();
  }

  render() {
    const { devices } = this.props;
    const deviceContainerStyle = { padding: '10px', backgroundColor: '#b3f0ff', marginBottom: '10px' };

    return (
      <div style={{ padding: '20px' }} id="my-devices-page">
        <Row>
          <Col xs={6}>
            <h2>My Devices</h2>
          </Col>
          <Col xs={6} style={{ textAlign: 'right' }}>
            <RaisedButton
              onClick={() => this.props.history.push('/new-device')}
              label="Add Raspberry Pi"
              primary
              style={{}}
            />
          </Col>
        </Row>

        { devices.isFetching ? <CircularProgress /> : (
          <div>
            {
              devices.devices.length === 0 ? (
                <Row>
                  No device paired yet.
                </Row>
              ) :
                devices.devices.map(device => (
                  <div key={device.iotaAddress} style={deviceContainerStyle}>
                    <Row>
                      <Col xs={8}>
                        {device.type} with IOTA address {device.iotaAddress.substring(0, 10)}...
                      </Col>
                      <Col xs={4} style={{ textAlign: 'right' }}>
                        <RaisedButton
                          onClick={() => this.props.deleteDevice(device)}
                          label="Delete"
                          primary
                          disabled={device.isDeleting}
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

MyDevices.propTypes = {
  history: PropTypes.shape(historyPropTypes),
  getDevices: PropTypes.func.isRequired,
  deleteDevice: PropTypes.func.isRequired,
  devices: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    devices: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      device: PropTypes.object,
      iotaAddress: PropTypes.string,
      type: PropTypes.string,
    })).isRequired,
  }),
};

function mapStateToProps(state) {
  const { devices } = state;
  return {
    devices,
  };
}

const mapDispatchToProps = {
  getDevices,
  deleteDevice,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MyDevices));
