import axios from 'axios';

// action types
export const REQUEST_SESSION = 'get_session';
export const RECEIVE_SESSION = 'update_session';
export const DEAUTHENTICATE = 'deauthenticate';

export const REQUEST_POLICIES = 'get_policies';
export const RECEIVE_POLICIES = 'update_policies';

export const REQUEST_ADD_POLICY = 'request_add_policy';
export const RECEIVE_POLICY = 'receive_policy';

export const REQUEST_DELETE_POLICY = 'request_delete_policy';
export const POLICY_DELETED = 'policy_deleted';

export const REQUEST_ADD_DEVICE = 'request_add_device';
export const RECEIVE_DEVICE = 'receive_device';

export const REQUEST_DEVICES = 'get_devices';
export const RECEIVE_DEVICES = 'update_devices';

export const REQUEST_DELETE_DEVICE = 'request_delete_device';
export const DEVICE_DELETED = 'device_deleted';

export function requestSession() {
  return { type: REQUEST_SESSION };
}

function receiveSession(json) {
  return {
    type: RECEIVE_SESSION,
    sessionId: json.sessionId,
    attributes: json.attributes,
    receivedAt: Date.now(),
  };
}

export function fetchSession() {
  return (dispatch) => {
    dispatch(requestSession());
    return axios
      .get('/api/get-session', {
        withCredentials: true,
      })
      .then(response => response.data)
      .then(json => dispatch(receiveSession(json)));
  };
}

export function requestPolicies() {
  return { type: REQUEST_POLICIES };
}

function receivePolicies(json) {
  return {
    type: RECEIVE_POLICIES,
    policies: json,
    receivedAt: Date.now(),
  };
}

export function getPolicies() {
  return (dispatch) => {
    dispatch(requestPolicies());
    return axios
      .get('/api/policy/all', {
        withCredentials: true,
      })
      .then(response => response.data)
      .then(json => dispatch(receivePolicies(json)));
  };
}

export function requestAddPolicy() {
  return { type: REQUEST_ADD_POLICY };
}

function receivePolicy(json) {
  return {
    type: RECEIVE_POLICY,
    policy: json,
  };
}

export function addPolicy(device, serviceProvider, goal) {
  const body = { device, serviceProvider, goal };

  const options = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  return (dispatch) => {
    dispatch(requestAddPolicy());
    return axios
      .post('/api/policy/new', body, options)
      .then(response => response.data)
      .then(json => dispatch(receivePolicy(json)));
  };
}

export function requestAddDevice() {
  return { type: REQUEST_ADD_DEVICE };
}

function receiveDevice(json) {
  return {
    type: RECEIVE_DEVICE,
    device: json,
  };
}

export function addDevice(iotaAddress, secret) {
  const device = { iotaAddress, type: 'Raspberry Pi' };
  const body = { device, secret };

  const options = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  return (dispatch) => {
    dispatch(requestAddDevice());
    return axios
      .post('/api/device/new', body, options)
      .then(response => response.data)
      .then(json => dispatch(receiveDevice(json)));
  };
}

export function requestDevices() {
  return { type: REQUEST_DEVICES };
}

function receiveDevices(json) {
  return {
    type: RECEIVE_DEVICES,
    devices: json,
    receivedAt: Date.now(),
  };
}

export function getDevices() {
  return (dispatch) => {
    dispatch(requestDevices());
    return axios
      .get('/api/device/all', {
        withCredentials: true,
      })
      .then(response => response.data)
      .then(json => dispatch(receiveDevices(json)));
  };
}

export function deauthenticate() {
  return dispatch =>
    axios
      .get('/api/deauthenticate', {
        withCredentials: true,
      })
      .then(() => dispatch(fetchSession()));
}

export function requestDeletePolicy(id) {
  return {
    type: REQUEST_DELETE_POLICY,
    id,
  };
}

export function requestDeleteDevice(id) {
  return {
    type: REQUEST_DELETE_DEVICE,
    id,
  };
}

function policyDeleted(json) {
  return {
    type: POLICY_DELETED,
    id: json.id,
    receivedAt: Date.now(),
  };
}

export function deletePolicy(id) {
  return (dispatch) => {
    dispatch(requestDeletePolicy(id));
    return axios
      .delete(`/api/policy/${id}`, {
        withCredentials: true,
      })
      .then(response => response.data)
      .then(json => dispatch(policyDeleted(json)));
  };
}

function deviceDeleted(json) {
  return {
    type: DEVICE_DELETED,
    id: json.id,
    receivedAt: Date.now(),
  };
}

export function deleteDevice(device) {
  return (dispatch) => {
    dispatch(requestDeleteDevice(device));
    return axios
      .post('/api/device/delete', { device }, {
        withCredentials: true,
      })
      .then(response => response.data)
      .then(json => dispatch(deviceDeleted(json)));
  };
}
