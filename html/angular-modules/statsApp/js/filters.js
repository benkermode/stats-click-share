'use strict';

angular.module ( 'statsApp.filters', [] )

  .filter ( 'numberCleaner', [   function () { 
    return function ( num ){
      //remove non-numbers, and check is a number, otherwise return false
      num = String( num ).replace ( /[^0-9$.,]/g, '' );
      num = ( Number ( num ) > 0 ) ? Number ( num ) : false;
      return ( num );
    }
  }])

  .filter ( 'numberDisplayer', [   function () { 
    return function ( num, showPlusSign, is_percentage, decimal_places ){
      //put large numbers in readable format with commas
      var formattedNum = '';
      if ( isNaN ( num ) ) {
        num = false;
      } else if ( Math.abs ( num ) > 100000 ) {
        formattedNum = ( Math.round ( num / 1000 ) ) + 'K';
      } else if ( Math.abs ( num ) > 10000 ) {
        formattedNum = ( num / 1000 ).toFixed ( 1 ) + 'K';
      } else {
        formattedNum = ( decimal_places>0) && is_percentage ? Number(num).toFixed ( decimal_places ) : num;//num.toLocaleString();
      }
      num = ( showPlusSign && (num > 0 ) ) ? '+' + formattedNum : formattedNum;
      num = ( is_percentage ) ? num + '%' : num;
      return num;
    }
  }])

  .filter ( 'getPercDiff', [ 'GlobalData', function ( GlobalData ) {
    return function ( inputNumber, compareToNumber ) {
      var perc = Math.round( inputNumber / compareToNumber * 100 ).toFixed ( GlobalData.percDecimalPlaces );
      var perc_diff =  ( perc > 0 ) ? perc - 100 : perc + 100;
      return perc_diff;
    }
  }])

  .filter ( 'barWidthFilter', [ function () {
    return function ( rawValue, maxWidth) {
      //return a percentage width where maxWidth would be 100%  (thus independant of screen width)
      //this filter could be configured differently, the main thing is to use it for all the bars
//      var percWidth = Math.round ( rawValue / maxWidth * 100 );
      var percWidth =  ( rawValue / maxWidth * 100 ).toFixed ( 2 );
      percWidth = ( percWidth > 100 ) ? 100 : percWidth;
      //console.log ( 'barWidthFilter: ' + rawValue + ', ' +  maxWidth );
      return percWidth;// + '%';
    }
  }])

  .filter ( 'barColorFilter', [ 'GlobalData', function ( GlobalData ) {
    return function ( rawColor, index, extrasRevealedCategory ) {
      var newColor = rawColor;
      //only change the color if is FALSE
      if ( rawColor === false ) {
        newColor = GlobalData.relativeColors [ index ] [ extrasRevealedCategory ];
      }
      return newColor;
    }
  }])
;
