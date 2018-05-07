import { combineReducers } from 'redux';
import {
  REQUEST_SESSION,
  RECEIVE_SESSION,

  REQUEST_DEVICES,
  RECEIVE_DEVICES,
  REQUEST_DELETE_DEVICE,
  DEVICE_DELETED,
  REQUEST_ADD_DEVICE,
  RECEIVE_DEVICE,

  REQUEST_POLICIES,
  RECEIVE_POLICIES,
  REQUEST_ADD_POLICY,
  RECEIVE_POLICY,
  REQUEST_DELETE_POLICY,
  POLICY_DELETED,
} from '../actions';

function user(
  state = {
    isFetching: false,
    sessionId: '',
    attributes: {},
  },
  action,
) {
  switch (action.type) {
    case REQUEST_SESSION:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_SESSION:
      return Object.assign({}, state, {
        isFetching: false,
        lastUpdated: action.receivedAt,
        sessionId: action.sessionId,
        attributes: action.attributes,
      });
    default:
      return state;
  }
}

function device(state = { isFetching: false, device: null }, action) {
  switch (action.type) {
    case REQUEST_ADD_DEVICE:
      return Object.assign({}, state, {
        ...state,
        isFetching: true,
      });
    case RECEIVE_DEVICE:
      return Object.assign({}, state, {
        ...state,
        isFetching: false,
        device: action.device,
      });
    default:
      return state;
  }
}

function devices(
  state = {
    isFetching: false,
    devices: [],
  },
  action,
) {
  switch (action.type) {
    case REQUEST_DEVICES:
      return Object.assign({}, state, {
        ...state,
        isFetching: true,
      });
    case RECEIVE_DEVICES:
      return {
        ...state,
        isFetching: false,
        devices: action.devices,
      };
    case REQUEST_DELETE_DEVICE: {
      const deletingIndex = state.devices.findIndex(p => p.id === action.id);
      state.devices[deletingIndex].isDeleting = true; // eslint-disable-line no-param-reassign
      return state;
    }
    case DEVICE_DELETED: {
      const deletedIndex = state.devices.findIndex(p => p.id === action.id);
      state.devices.splice(deletedIndex, 1);
      return Object.assign({}, state, {
        ...state,
      });
    }
    default:
      return state;
  }
}

function policies(
  state = {
    isFetching: false,
    policies: [],
  },
  action,
) {
  switch (action.type) {
    case REQUEST_POLICIES:
      return Object.assign({}, state, {
        ...state,
        isFetching: true,
      });
    case RECEIVE_POLICIES:
      return Object.assign({}, state, {
        ...state,
        isFetching: false,
        policies: action.policies,
      });
    case REQUEST_DELETE_POLICY: {
      const deletingIndex = state.policies.findIndex(p => p.id === action.id);
      state.policies[deletingIndex].isDeleting = true; // eslint-disable-line no-param-reassign
      return state;
    }
    case POLICY_DELETED: {
      const deletedIndex = state.policies.findIndex(p => p.id === action.id);
      state.policies.splice(deletedIndex, 1);
      return Object.assign({}, state, {
        ...state,
      });
    }
    default:
      return state;
  }
}


function policy(
  state = {
    isFetching: false,
    policy: null,
  },
  action,
) {
  switch (action.type) {
    case REQUEST_ADD_POLICY: {
      return Object.assign({}, state, {
        ...state,
        isFetching: true,
      });
    }
    case RECEIVE_POLICY:
      return Object.assign({}, state, {
        ...state,
        isFetching: false,
        ...action.policy,
      });
    default:
      return state;
  }
}
const rootReducer = combineReducers({
  user,
  device,
  devices,
  policy,
  policies,
});

export default rootReducer;
