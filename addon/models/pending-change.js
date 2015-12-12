import DS from "ember-data";

export default DS.Model.extend({
  modelName:     DS.attr('string'),
  serialized:    DS.attr(),
  operation:     DS.attr('string'),
  createdAt:     DS.attr('string'),
});
