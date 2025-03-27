import { GUI } from 'dat.gui';
import * as THREE from 'three';
import SceneCameraManager from '../scene/SceneCameraManager';

export class CameraControlsManager {
    constructor(sceneCameraManager, renderer) {
        // Validate inputs
        if (!(sceneCameraManager instanceof SceneCameraManager)) {
            throw new Error('Invalid SceneCameraManager provided');
        }

        this.sceneCameraManager = sceneCameraManager;
        this.renderer = renderer;
        this.gui = new GUI();
        this.controllers = {};

        // Create a temporary camera to use for controls if not immediately available
        this.tempCamera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.tempCamera.position.set(0, 0, 200);

        this.initializeCameraControls();
    }

    // Ensure this method is a method, not a property
    getCurrentCamera() {
        return this.sceneCameraManager.camera || this.tempCamera;
    }

    initializeCameraControls() {
        const cameraFolder = this.gui.addFolder('Camera Controls');

        // Dynamic Perspective Toggle
        this.controllers.dynamicPerspective = cameraFolder.add(
            this.sceneCameraManager.config, 
            'dynamicPerspective'
        ).name('Dynamic Perspective');

        // Camera Type Selector
        this.controllers.cameraType = cameraFolder.add(
            this.sceneCameraManager.config, 
            'cameraType', 
            ['perspective', 'orthographic']
        ).onChange((type) => {
            if (this.renderer) {
                this.sceneCameraManager.config.cameraType = type;
                this.sceneCameraManager.initializeCamera(this.renderer);
            }
        }).name('Camera Type');

        // FOV Control (only for Perspective Camera)
        this.controllers.fov = cameraFolder.add(
            this.sceneCameraManager.config, 
            'fov', 
            30, 
            120
        ).onChange((fov) => {
            // Use the method to get the current camera
            const camera = this.getCurrentCamera();
            
            // Ensure it's a perspective camera before updating
            if (camera && camera instanceof THREE.PerspectiveCamera) {
                camera.fov = fov;
                camera.updateProjectionMatrix();
            }
        }).name('Field of View');

        // Camera Position Controls
        const positionFolder = cameraFolder.addFolder('Camera Position');
        
        // Create a proxy object for camera position
        const cameraPositionProxy = {
            x: this.tempCamera.position.x,
            y: this.tempCamera.position.y,
            z: this.tempCamera.position.z
        };

        ['x', 'y', 'z'].forEach(axis => {
            this.controllers[`position${axis.toUpperCase()}`] = positionFolder.add(
                cameraPositionProxy, 
                axis, 
                -500, 
                500
            ).onChange((value) => {
                const camera = this.getCurrentCamera();
                if (camera) {
                    camera.position[axis] = value;
                }
            }).name(`Position ${axis.toUpperCase()}`);
        });

        positionFolder.open();
        cameraFolder.open();
    }

    // Update method to refresh camera controls when camera is initialized
    updateCameraControls() {
        // Refresh position controllers if camera is now available
        const camera = this.getCurrentCamera();
        if (camera) {
            ['x', 'y', 'z'].forEach(axis => {
                if (this.controllers[`position${axis.toUpperCase()}`]) {
                    this.controllers[`position${axis.toUpperCase()}`]
                        .min(-500)
                        .max(500)
                        .setValue(camera.position[axis]);
                }
            });
        }
    }

    // Cleanup method
    dispose() {
        this.gui.destroy();
    }
}

export default CameraControlsManager;