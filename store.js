import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

const initialState = {
  selectedSound: null,
  serverIP:null,
  serverPort:null
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_SELECTED_SOUND":
      return { ...state, selectedSound: action.payload };
      case "SET_SERVER_IP":
      return { ...state, serverIP: action.payload };
      case "SET_SERVER_PORT":
      return { ...state, serverPort: action.payload };
    default:
      return state;
  }
}

const store = createStore(rootReducer, applyMiddleware(thunk));

export { store };

