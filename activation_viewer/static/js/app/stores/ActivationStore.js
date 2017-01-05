import AppDispatcher from 'boundless-sdk/dispatchers/AppDispatcher';
import {EventEmitter} from 'events';


class ActivationStore extends EventEmitter {
  constructor(){
    super();
    this.activations = [];
  }

  addActivation(activation){
    this.activations.push(activation);
    this.emitChange();
  }

  removeActivation(activation){
    this.activations.forEach(function(_activation, index){
      if (_activation.activation_id === activation.activation_id){
        this.activations.splice(index, 1);
      }
    });
    this.emitChange();
  }

  getActivations(){
    return this.activations;
  }

  emitChange() {
    this.emit('CHANGE');
  }

  addChangeListener(cb) {
    this.on('CHANGE', cb);
  }

  removeChangeListener(cb) {
    this.removeListener('CHANGE', cb);
  }
} 

var _activationStore = new ActivationStore();

export default _activationStore;

AppDispatcher.register(function(payload){
  let action = payload.action;
  if (action.type === 'add-activation'){
    _activationStore.addActivation(action.activation);
  }
  if (action.type === 'remove-activation'){
    _activationStore.removeActivation(action.activation)
  }
});