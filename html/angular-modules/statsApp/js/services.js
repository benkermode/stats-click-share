'use strict';

angular.module ( 'statsApp.services', [])


  .factory( 'GlobalData', function () {
    return {};
  })

  .factory( 'ScreenVars', function () {
    return {}
  })

  .service ( 'DataService', [ '$http', function ( $http ) {
    return {
      //mock method for returning one of 4 discreet json files
      GetPageData: function ( page ) {
        page = ( page <= 4) ? page : 4;
        var url = 'data/click-share-p' + String( page ) + '.json';
        console.log ( 'getting: ' + url );
        //change url to test data error
        return $http.get ( url );
      }
    }
  }])

  .factory( 'MediaWatcher', [ '$window', 'ScreenVars','$timeout','$rootScope',  function ( $window, ScreenVars, $timeout, $rootScope ) {
    return {
      init: function () {

        //these obviously match rules in external CSS, and are most effective when they do: Not perfectly DRY, but still nifty
        var Watch1024 = $window.matchMedia ( '(min-width: 1024px)' );
        var Watch768 = $window.matchMedia ('(min-width: 768px) and (max-width: 1023px)' );
        var Watch480 = $window.matchMedia ('(min-width: 480px) and (max-width: 767px)');
        var Watch320 = $window.matchMedia ('(min-width: 320px) and (max-width: 479px)');

        //this handler will get called by any of the Watchers above, so we have to check which one
        var handleMediaChange = function ( mediaQueryList ) {
          if ( mediaQueryList.matches ) {
            //set ScreenSize to numbers for use of comparison operators
            if ( mediaQueryList.media.indexOf ( '1024px' ) > -1 ) {
              ScreenVars.screenSize = 1024;
            } else if ( mediaQueryList.media.indexOf ( '768px' ) > -1 ) {
              ScreenVars.screenSize = 768;
            } else if ( mediaQueryList.media.indexOf ( '480px' ) > -1 ) {
              ScreenVars.screenSize = 480;
            } else if ( mediaQueryList.media.indexOf ( '320px' ) > -1 ) {
              ScreenVars.screenSize = 320;
            } 
            if ( ScreenVars.svgElement ) {
              ScreenVars.svgWidth = ScreenVars.svgElement.offsetWidth;
              console.log ( "ScreenVars.svgHeight: " + ScreenVars.svgHeight);
              ScreenVars.svgHeight = ScreenVars.svgElement.offsetHeight;

            }
            $rootScope.$broadcast('screenVarsChanged',  {});

          }
        }

        Watch1024.addListener( handleMediaChange );
        Watch768.addListener( handleMediaChange );
        Watch480.addListener( handleMediaChange );
        Watch320.addListener( handleMediaChange );
        handleMediaChange ( Watch1024 );
        handleMediaChange ( Watch768 );
        handleMediaChange ( Watch480 );
        handleMediaChange ( Watch320 );

      }
    }
  }])

  .factory ( 'GraphBuilder', [ 'ScreenVars', 'GraphSettings', '$filter','$timeout',  function ( ScreenVars, GraphSettings, $filter, $timeout ) {
    return {
      buildOneGraph: function ( index, which, article ) {
        //build One Graph is responsible for setting the x and y of bars, x, y and text color of the text for one Graph
        //the bar widths are percentages and they are already set, and don't need to update
        //this function needs to be called by screenSize changes, changes in SVG width

        //make sure these variables are ready (require at least directive.link for svgWidth)
        if ( ( ScreenVars.svgWidth != undefined) && (ScreenVars.screenSize != undefined ) ) {

          if ( 
            ( article.lastSvgWidth == ScreenVars.svgWidth ) &&
              ( article.lastScreenSize == ScreenVars.screenSize ) &&
              ( article.lastCategory == which ) 
          ){
            //do nothing: the graph has been built in the exact current state
            //this can happen on page load, or clicking between articles
            console.log ( 'buildOneGraph called, not needed' );
          } else {
            //only build if we have the vars ready

            var device = ( ScreenVars.screenSize >= 768 ) ? 'desktop' : 'mobile';
            console.log ( 'buildOneGraph (' + device + ' )GO: ' + index + ', ' + which );
            article.lastSvgWidth = ScreenVars.svgWidth;
            article.lastScreenSize = ScreenVars.screenSize;
            article.lastCategory == which;

            var count = 0;
            var previousBarBottom;
            angular.forEach ( article.selectedGraphData, function(v, k){
              //console.log ( 'device: ' + device );
              //v relates to one bar and its associated label
              //****must at least have a .value property, otherwise don't build a BAR for it
              if ( v.value != undefined ) {
                var bar = v; 
                //***SETTINGS FOR THE BAR***
                bar.x = 0;
                //this calculation allows for bars of varying heights
                var yOffsetForLabel = ( GraphSettings [ device ].textY == "aboveBar" ) ? GraphSettings [ device ].fontSize : 0; 
                if ( count == 0 ) {
                  bar.y = GraphSettings [ device ].graphTopMargin + yOffsetForLabel;
                } else {
                  bar.y = previousBarBottom + GraphSettings [ device ].barBottomMargin;
                }
                //setting below will be used by the next iteration above
                var barHeightMagnifyRatio = ( v.bar_height_ratio > 0 ) ? v.bar_height_ratio : 1; 
                bar.height = GraphSettings [ device ].height * barHeightMagnifyRatio;
                previousBarBottom = bar.y + bar.height;
                bar.width = $filter ( 'barWidthFilter' ) ( bar.value, article.selectedGraphData.max.value );
                bar.color = $filter ( 'barColorFilter' ) ( bar.color, index, which );
                //***SETTINGS FOR THE LABEL***
                bar.text = {};
                //filter only needs percentage width, it will use GlobalData.svgWidth to calculate pixelWidth
                bar.text.fontSize = GraphSettings [ device ].fontSize;

                var pixelBarWidth = pixelBarWidth = Math.round ( ScreenVars.svgWidth * bar.width / 100 );
                var textFitsInsideBar = ( pixelBarWidth >  GraphSettings.assumeTextWidth ) ? true : false;
                if ( GraphSettings [ device ].textX == 'leftAlign' ) {
                  bar.text.x = bar.x;
                } else if ( GraphSettings [ device ].textX == 'rightAlign' ) {
                  //bar.width is a raw percentage value
                  bar.text.x = textFitsInsideBar 
                    ? pixelBarWidth - GraphSettings.assumeTextWidth 
                    : pixelBarWidth + GraphSettings.textPadding;
                } 
                if (( GraphSettings [ device ].textY == "aboveBar" ) || ( !textFitsInsideBar )) {
                  bar.text.fill = GraphSettings.textFillOutside;
                } else {
                  bar.text.fill = GraphSettings.textFillInside;
                }
                //&& GraphSettings [ device ].textY == "insideBar"
                if ( GraphSettings [ device ].textY == "insideBar"  ) {
                  bar.text.y = bar.y + ((bar.height - bar.text.fontSize) / 2);
                } else {
                  bar.text.y = bar.y - bar.text.fontSize ;
                }

                //temp
                //              console.log ( 'textY: ' + GlobalData.graphSettings [ device ].textY );
                //              console.log ( 'bar.text: ' + JSON.stringify ( bar.text) );
                count++;
              }//end if v.value
            } );
            //previousBarBottom is now the height of the graph: can use it for vertical centering
            //this function is only called when an svg is expanded: use $timeout to get the offsetHeight
            $timeout ( function () {
              var currentlyExpandedSVG = document.getElementById ( 'svg-' + index );
              ScreenVars.graphTopOffset = ( currentlyExpandedSVG.offsetHeight - previousBarBottom ) / 2;
              // console.log ( 'svg-' + $scope.extrasRevealedIndex + '.height: ' + currentlyExpandedSVG.offsetHeight );
              //console.log ( 'ScreenVars.graphTopOffset: ' + ScreenVars.graphTopOffset );
            });
          }
        }
      }
    }

  }])

.factory ( 'DataBuilder', [ 'GraphDataTemplate', function ( GraphDataTemplate ) {
  return {
    buildArticles: function ( scope ) {
      //manually clean the global numbers: we know every prop is a number

      //**SET THE GRAPH DATA**/
      angular.forEach ( scope.articles, function ( v, k ) {
        //v is 1 article : each article needs a copy of GraphDataTemplate
        v.graphData = angular.copy ( GraphDataTemplate );
        angular.forEach ( v.graphData, function ( v1, k1 ) {
          //v1 is each grouping of bar graphs, groups include: share_rate, click_rate, pageviews
          angular.forEach ( v1, function ( v2, k2 ) {
            //v2: JS object referring to ONE BAR AND ITS LABEL: 
            //if the use_scope_var property has a vlue, get its value and insert it
            //only one of these can be set on any one object
            if ( v2.use_scope_var || v2.use_children_object ) {
              //property_name can only be 'use_scope_var' or 'use_children_object'
              var property_name = ( v2.use_scope_var ) ? 'use_scope_var':
                (( v2.use_children_object ) ? 'use_children_object': false);
              //console.log ( 'property_name: ' + property_name );
              var valToInsert;
              if ( v2.use_scope_var ) {
                //assume it's a global variable previously placed on the scope
                valToInsert = scope [ v2.use_scope_var ];
              }
              //or if the value has "article." in the string, use the individual article scope level                     
              //v2 [ property_name ] is the property VALUE
              //eg property_name "use_scope_var", and v2 [ property_name ] = "article.click_rate"
              if ( v2 [ property_name ].indexOf ( 'article.') > -1 ) {
                var use_variable_name = v2[ property_name ].split ( 'article.' ) [1];
                valToInsert = scope.articles [ k ] [ use_variable_name ];
                //*****ONLY INSERT use_children_object if it exists in the incoming data!!!*****
                if ( valToInsert && v2.use_children_object ) {
                  //make a copy of the object, then REMOVE the click_rate_children object from the template
                  //otherwise the grapher will try and build a bar for the click_rate_children object
                  var copied_use_children_ojbect = angular.copy ( valToInsert );
                  //loop over each child and add it to v1: the current grouping of bar graphs
                  angular.forEach ( valToInsert, function (v3, k3) {
                    //console.log ( 'child to add: ' + JSON.stringify ( v3 ) );
                    //append v3, the current child object, to v1: the current group of bars
                    v1 [ k3 ] = v3; 
                  } );
                  //v2 = false;
                }

              }
              //now set the value on one Graph BAR object
              if ( v2.use_scope_var ) {
                v2.value = valToInsert;
              }
            }
            //if ( k == 0 ) { console.log ( 'v2; ' + JSON.stringify ( v2 ) ); }
          });
        });
      });


    }
  }
}])

;
