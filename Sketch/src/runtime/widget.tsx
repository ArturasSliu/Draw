/** @jsx jsx */
import { AllWidgetProps, BaseWidget, jsx, React } from "jimu-core";
import { IMConfig } from "../config";
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { ColorPicker } from "jimu-ui/basic/color-picker";
import { Icon } from 'jimu-ui';
import { TextInput } from 'jimu-ui';

//import Sketch = require("esri/widgets/Sketch");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import SketchViewModel = require("esri/widgets/Sketch/SketchViewModel");
import Expand = require("esri/widgets/Expand");
import Point = require("esri/geometry/Point");

import './css/style.scss'

interface IState {
  jimuMapView: JimuMapView;

}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig>, any> {
  private myRef = React.createRef<HTMLDivElement>();

  constructor(props) {
    super(props);
    this.state = {
      jimuMapView: null,
      currentWidget: null,
      latitude: "",
      longitude: "",
      color: "#000000",
      textInput: "text"
    };
  }


  activeViewChangeHandler = (jmv: JimuMapView) => {
    if (this.state.jimuMapView) {
      // we have a "previous" map where we added the widget
      // (ex: case where two Maps in single Experience page and user is switching
      // between them in the dropdown) - we must destroy the old widget in this case.
      if (this.state.currentWidget) {
        this.state.currentWidget.destroy();
      }
    }

    if (jmv) {
      this.setState({
        jimuMapView: jmv
      });

      if(this.myRef.current) {
        const container = document.createElement("div");
        this.myRef.current.appendChild(container);

        jmv.view.on("pointer-move", (evt) => {
          const point: Point = this.state.jimuMapView.view.toMap({
            x: evt.x,
            y: evt.y
          });
          this.setState({
            latitude: point.latitude.toFixed(3),
            longitude: point.longitude.toFixed(3)
          });
        });

        const layer = new GraphicsLayer({
          id: "tempGraphics"
        });
        
        //jmv.view.map.add(layer);

        let editGraphic;

        const pointSymbol = {
          type: "text",
          text: "\ue61d",
          color: this.state.color,
          font: {
            size: "16px",
            family: "CalciteWebCoreIcons"
          },
          outline: {
            color: [255, 255, 255],
            width: 3
          }
        };

        const polylineSymbol = {
          type: "simple-line",
          color: this.state.color,
          width: "4",
        };

        const polygonSymbol = {
          type: "simple-fill",
          color: this.state.color,
          style: "solid",
          outline: {
            color: "white",
            width: 1
          }
        };

        const textSymbol = {
          type: "text",
          color: "#000000",
          haloColor: "black",
          haloSize: "1px",
          text: "default text",
          xoffset: 3,
          yoffset: 3,
          font: {  // autocast as new Font()
            size: 12,
            family: "sans-serif",
            weight: "bold"
          }
        };

        const arrowSymbol = {
          type: "simple-line",
          style: "arrow",
          color: this.state.color,
          width: "4"
        };

        jmv.view.when(() =>{
          const sketchViewModel = new SketchViewModel({
            view: jmv.view,
            layer: layer,
            pointSymbol,
            polylineSymbol,
            polygonSymbol
          });

          window.addEventListener('click', () => {
            switch (sketchViewModel.activeTool) {
              case 'polyline':
                sketchViewModel.polylineSymbol.color.setColor(this.state.color);
                console.log(sketchViewModel.polylineSymbol.color);
                break;
              case 'polygon':
                sketchViewModel.polygonSymbol.color.setColor(this.state.color);
                console.log("polygon");
                break;
              case 'point':
                sketchViewModel.pointSymbol.color.setColor(this.state.color);
                console.log("point");
                break;
              case 'rectangle':
                sketchViewModel.polygonSymbol.color.setColor(this.state.color);
                console.log("rectangle");
                break;
              case 'circle':
                sketchViewModel.polygonSymbol.color.setColor(this.state.color);
                console.log("circle");
                break;
            };
            textSymbol.text = this.state.textInput;
            

          });
          sketchViewModel.on("create", addGraphic);

          sketchViewModel.on("update", updateGraphic);


          function addGraphic(event){
            if(event.state === "complete"){
              let graphicSymbol;
              if (document.querySelector("button.active").id === "textButton") {
                graphicSymbol = textSymbol;
                graphicSymbol.text = this.state.textInput;
                console.log(this.state.textInput);
                //graphicSymbol.text = prompt("Please enter some text", "Default Text");
              } else {
                //graphicSymbol = polylineSymbol;
                graphicSymbol = sketchViewModel.createGraphic;
                //jmv.view.map.add(graphic)
              }
              console.log(graphicSymbol);
              const graphic = new Graphic({
                geometry: event.geometry,
                symbol: graphicSymbol
              });
              jmv.view.graphics.add(graphic);
            }
          };

          function updateGraphic(event) {
            if(event.state === "complete" || event.state === "cancel"){
              console.log("updateGraphic");
              var graphic = new Graphic({
                geometry: event.geometry,
                symbol: editGraphic.symbol
              });
              jmv.view.graphics.add(graphic);
    
              editGraphic = null;
            }
            
          };

          /*function setUpClickHandler() {
            jmv.view.on("click", function(event){
              jmv.view.hitTest(event).then(function (response) {
                var results = response.results;
                if (results.length > 0) {
                  for (var i = 0; i < results.length; i++) {
                    if (!editGraphic && results[i].graphic.layer.id === "tempGraphics") {
                      editGraphic = results[i].graphic;
                      break;
                    }
                  }
                }
              });

            });

          };*/

          var drawPointButton = document.getElementById("pointButton");
          drawPointButton.onclick = function () {
            sketchViewModel.create("point");
            setActiveButton(this);
          };

          var drawLineButton = document.getElementById("polylineButton");
          drawLineButton.onclick = function () {
            sketchViewModel.create("polyline");
            setActiveButton(this);
          };

          var drawPolygonButton = document.getElementById("polygonButton");
          drawPolygonButton.onclick = function () {
            sketchViewModel.create("polygon");
            setActiveButton(this);
          };

          var drawRectangleButton = document.getElementById("textButton");
          drawRectangleButton.onclick = function () {
            sketchViewModel.create("point");
            setActiveButton(this);
          };

          var drawRectangle = document.getElementById("rectangle");
          drawRectangle.onclick = function () {
            sketchViewModel.create("rectangle");
            setActiveButton(this);
          };

          var drawCircleButton = document.getElementById("circle");
          drawCircleButton.onclick = function () {
            sketchViewModel.create("circle");
            setActiveButton(this);
          };

          var drawFreePolygon = document.getElementById("freePolygonButton");
          drawFreePolygon.onclick = function () {
            sketchViewModel.create("polygon", {mode: "freehand"});
            setActiveButton(this);
          };

          var drawResetButton = document.getElementById("resetBtn");
          drawResetButton.onclick = function () {
            console.log("del");
            layer.removeAll();
            setActiveButton(this);
          };

          function setActiveButton(selectedButton) {
            // focus the view to activate keyboard shortcuts for sketching
            jmv.view.focus();
            var elements = document.getElementsByClassName("active");
            for (var i = 0; i < elements.length; i++) {
              elements[i].classList.remove("active");
            }
            if (selectedButton) {
              selectedButton.classList.add("active");
            }
          };

          const sketch = document.createElement("div");
          sketch.appendChild(drawPointButton);
          sketch.appendChild(drawLineButton);
          sketch.appendChild(drawPolygonButton);
          sketch.appendChild(drawRectangleButton);
          sketch.appendChild(drawRectangle);
          sketch.appendChild(drawCircleButton);
          sketch.appendChild(drawFreePolygon);
          sketch.appendChild(drawResetButton);


          

          const layerListExpand1 = new Expand({
            expandIconClass: "esri-icon-layer-list",
            expandTooltip: "Expand sketch widget",
            view: jmv.view,
            content: sketch,
            container: container
          });

        });

        jmv.view.map.add(layer);
        
      } else {
          console.error('could not find this.myRef.current');
      }

      
    }


    
  };

  updateSelectionHighlightColor = (c: string) => {

    this.setState(()  => {
      return {color: c};
    });
    console.log("should have changed the color to: ");
    console.log(c);
  };


  // activeViewChangeHandler is not called in the builder when "None" is selected
  // for the map, so we must cleanup here:
  componentDidUpdate = evt => {
    if (this.props.useMapWidgetIds.length === 0) {
      // "None" was selected in the "Select map widget" dropdown:
      if (this.state.currentWidget) {
        this.state.currentWidget.destroy();
      }
    }
  };

  onButtonClick = () => {
    var element = document.getElementById("textInput");
    element.classList.toggle("hide");
  };

  colorPickerShowHide = () => {
    var element = document.getElementById("colorPicker");
    element.classList.toggle("hide");
  };

  onTextInput = (c: string) => {
    this.setState(() => {
      return {textInput: c};
    });
    console.log("this.state.textInput was set to: ", this.state.textInput, " this is c: ", c);
  };

  render() {
    // If the user has selected a map, include JimuMapViewComponent.
    // If not, show a message asking for the Experience Author to select it.
    let jmc = <p>Please select a map.</p>;
    if(
      this.props.hasOwnProperty("useMapWidgetIds") &&
      this.props.useMapWidgetIds &&
      this.props.useMapWidgetIds.length === 1
    ){
      jmc = (
        <JimuMapViewComponent
          useMapWidgetIds={this.props.useMapWidgetIds}
          onActiveViewChange={this.activeViewChangeHandler}
        />
      );
    }

    //<TextInput placeholder="Enter your name..." defaultValue="abc"/>
    /* <div className="answer_list" > WELCOME </div>
            <input type="button" name="answer" value="Show Text Field" onClick={this.onButtonClick} />
            <input className="hide" type="text" id="textInput" value="..." /> */ 

    return (
      <div className="widget-Draw jimu-widget" >
        <div className="here" ref={this.myRef}></div>
        {jmc}
        <div id="viewDiv">
          <div id="topbar">
            <button className="action-button esri-icon-blank-map-pin" id="pointButton" type="button" title="Draw point" onClick={this.colorPickerShowHide}></button>
            <button className="action-button esri-icon-polyline" id="polylineButton" type="button" title="Draw polyline" onClick={this.colorPickerShowHide}></button>
            <button className="action-button esri-icon-polygon" id="polygonButton" type="button" title="Draw polygon" onClick={this.colorPickerShowHide}></button>
            <button className="action-button esri-icon-comment" id="textButton" type="button" title="Add Text" onClick={this.onButtonClick}></button>
            <TextInput className="hide" placeholder="Enter text" id="textInput" onAcceptValue={this.onTextInput}></TextInput>
            <button className="action-button esri-icon-checkbox-unchecked" id="rectangle" type="button" title="Add rectangle" onClick={this.colorPickerShowHide}></button>
            <button className="action-button esri-icon-radio-unchecked" id="circle" type="button" title="Draw circle" onClick={this.colorPickerShowHide}></button>
            <button className="action-button esri-icon-feature-layer" id="freePolygonButton" type="button" title="Draw free drawn polygon" onClick={this.colorPickerShowHide}></button>
            <button className="action-button esri-icon-trash" id="resetBtn" type="button" title="Clear graphics"></button>
          </div>
        </div>
        <i className='hide' id="colorPicker">
          <ColorPicker className='widget-Draw colorPicker show' style={{padding: '0'}} width={26} height={14}
            color={this.state.color}
            onChange={this.updateSelectionHighlightColor}>
          </ColorPicker>
        </i>
        <div className='widget-Draw absolute'>Lat/Lon: {this.state.latitude} {this.state.longitude}</div>
      </div>
    );
  }
}
