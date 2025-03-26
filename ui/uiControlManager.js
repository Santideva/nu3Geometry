// uiControlManager.js
import * as THREE from 'three';
import { GUI } from 'dat.gui';

export class UIControlManager {
    constructor(visualizer, config = {}) {
        this.visualizer = visualizer;
        this.gui = new GUI();
        this.controllers = {};
        
        this.initializeControls(config);
    }

    initializeControls(config) {
        const geometryFolder = this.gui.addFolder('Geometry Controls');
        
        // Radius Control
        this.controllers.radius = geometryFolder.add(
            this.visualizer.state, 
            'radius', 
            config.radiusMin || 50, 
            config.radiusMax || 200
        ).onChange(() => this.visualizer.updateSimulationParameters({
            radius: this.visualizer.state.radius
        }));

        // Polygon Count Control
        this.controllers.polygonCount = geometryFolder.add(
            this.visualizer.state, 
            'polygonCount', 
            config.polygonMin || 100, 
            config.polygonMax || 1000
        ).onChange(() => this.visualizer.updateSimulationParameters({
            polygonCount: this.visualizer.state.polygonCount
        }));

        // Shape Morphing Dropdown
        this.controllers.shapeSelector = geometryFolder.add(
            this.visualizer.state, 
            'currentShape', 
            config.availableShapes || ['Sphere', 'Cube', 'Cone']
        ).onChange((shapeName) => this.visualizer.morphToShape(shapeName));

        // Dynamic Evolution Toggle
        this.controllers.dynamicEvolution = geometryFolder.add(
            this.visualizer.state, 
            'dynamicEvolution'
        );

        // Morph Speed Control
        this.controllers.morphSpeed = geometryFolder.add(
            this.visualizer.state, 
            'morphSpeed', 
            0.1, 
            2.0
        );

        geometryFolder.open();
    }

    // Cleanup method
    dispose() {
        this.gui.destroy();
    }
}