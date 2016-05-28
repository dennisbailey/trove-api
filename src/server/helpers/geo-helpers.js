// Converts from degrees to radians.
var radians = function(degrees) {
  return degrees * Math.PI / 180;
};
   
// Converts from radians to degrees.
var degrees = function(radians) {
  return radians * 180 / Math.PI;
};

// Do some fancy maths to find all points (given a starting latitude and longitude) that are within a given radius
var sortByDistance = function(array, lat, lng, radiusSearch) {

  var result = [];
  
  for (var i = 0; i < array.length; i++) { 
    var distance = Math.acos(Math.sin(radians(lat))*Math.sin(radians(array[i].lat)) + Math.cos(radians(lat))*Math.cos(radians(array[i].lat))*Math.cos(radians(array[i].lng)-radians(lng))) * 3959;

    if (distance < radiusSearch) { array[i].distance = distance;
                                   result.push(array[i]);
    }     
    
  }

  return result;

};


module.exports = {
  radians : radians,
  degrees : degrees,
  sortByDistance : sortByDistance
};
