'use strict';

angular.module ( 'statsApp.directives', [])

  .directive ( 'getRelativeColor', [ 'GlobalData', function ( GlobalData ) {
    return {
      restrict: 'A',
      link: function ( scope, element, attrs ) {
        //get the percentage difference
        var percDiff = attrs [ 'getRelativeColor' ];
        //get the percDiff considered the maximum color difference (above which color will no longer change)
        var maxColor = attrs [ 'maxColorValue' ];
        var rgbArray = [ GlobalData.rgbNuetralGray, GlobalData.rgbNuetralGray, GlobalData.rgbNuetralGray ];
        //choose red [0] for neg perc diff and green [1] for positive perc diff
        //assume green
        var rgbIndexToChange = ( percDiff > 0 ) ? 1 : 0;

        //colorOffsetRaw is the absolute value of percDiff ( as color values for red and green are positive)
        //but colorOffsetRaw has a max value of maxColor
        var colorOffsetRaw = ( Math.abs ( percDiff ) > maxColor ) ? maxColor : Math.abs ( percDiff );
        var maxColorIncrease = 255 - rgbArray [ rgbIndexToChange ];
        var maxColorRatio = maxColorIncrease / maxColor;
        var actualColorShift = Math.round ( maxColorRatio * colorOffsetRaw );
        rgbArray [ rgbIndexToChange ] += actualColorShift;

        var curColor = 'rgb( ' + rgbArray [0] + ', ' + rgbArray [1] + ', ' + rgbArray [2] + ')';
        var applyColorTo = attrs [ 'applyColorTo' ];
        element[0].style [ applyColorTo ] = curColor;
        //if the my-group attribute is set: save this color globally
        if ( attrs [ 'myGroup' ] ) {
          GlobalData.relativeColors = GlobalData.relativeColors || {};
          GlobalData.relativeColors [ scope.$index ] = GlobalData.relativeColors [ scope.$index ] || [];
          GlobalData.relativeColors [ scope.$index ] [ attrs [ 'myGroup' ] ] = curColor;
          //console.log ( 'curColor : ' +  curColor );
          //console.log ( 'scope.index : ' +  scope.$index );
          //console.log ( 'saved color : ' +  GlobalData.relativeColors [ scope.$index ] [ attrs [ 'myGroup' ] ] );
        }

        // if ( scope.$index == 0 ) {
        // }
      }
    }
  }] )

  .directive ( 'getSvgWidth',  [ 'ScreenVars', '$rootScope',  function ( ScreenVars,$rootScope ) { 
    return {
      restrict: 'A',
      link: function ( scope, element, attrs ) {
        //set this once on load
        if ( attrs [ 'getSvgWidth' ] == 0 ) {

          ScreenVars.svgElement = element[0];
          ScreenVars.svgWidth = element[0].offsetWidth;
          ScreenVars.svgHeight = element[0].offsetHeight;
          //          $rootScope.$apply( function() {
          $rootScope.$broadcast('screenVarsChanged',  {});
//          });
        }
      }
    }
  }])

;
