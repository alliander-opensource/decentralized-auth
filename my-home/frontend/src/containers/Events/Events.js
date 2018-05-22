import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid';
import CircularProgress from 'material-ui/CircularProgress';

import { getEvents } from '../../actions';

class Events extends Component {
  componentDidMount() {
    this.props.getEvents();
  }

  render() {
    const { events } = this.props;

    const eventContainerStyle = {
      padding: '10px',
      backgroundColor: '#b3f0ff',
      marginBottom: '10px',
    };

    return (
      <div style={{ padding: '20px' }} id="events-page">
        <Row>
          <Col xs={8}>
            <h2>Events</h2>
          </Col>
        </Row>

        { events.isFetching ? <CircularProgress /> : (
          <div>
            {
              events.events.length === 0 ? (
                <Row>
                  No events yet.
                </Row>
              ) :
                events.events.map(event => (
                  <div key={event} style={eventContainerStyle}>
                    <Row>
                      {JSON.stringify(event)}
                    </Row>
                    <br />
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

Events.propTypes = {
  getEvents: PropTypes.func,
  events: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

function mapStateToProps(state) {
  const { events } = state;
  return {
    events,
  };
}

const mapDispatchToProps = {
  getEvents,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Events));
