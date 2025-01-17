import { Machine, MachineType } from '@snapmaker/luban-platform';

import { quickSwapKitModule, bracingKitModule } from './snapmaker-2-modules';
import {
    L20WLaserToolModule,
    L2WLaserToolModule,
    L40WLaserToolModule,
    dualExtrusionPrintToolHead,
    highPower10WLaserToolHead,
    highPower200WCNCToolHead,
    printToolHead,
    standardCNCToolHead,
    standardLaserToolHead,
} from './snapmaker-2-toolheads';
import { JobOffsetMode } from '../constants/coordinate';

/*
    {
        value: 'A250',
        alias: ['SM2-M', 'Snapmaker 2.0 A250'],
    },
*/

export const machine: Machine = {
    identifier: 'Snapmaker 2.0 A250',

    fullName: 'Snapmaker 2.0 A250/A250T/F250',
    machineType: MachineType.MultiFuncionPrinter,

    img: '/resources/images/machine/size-2.0-A250.png',

    metadata: {
        size: { x: 230, y: 250, z: 230 },

        toolHeads: [
            {
                identifier: printToolHead.identifier,
                configPath: 'printing/a250_single',
            },
            {
                identifier: dualExtrusionPrintToolHead.identifier,
                configPath: 'printing/a250_dual',
                workRange: {
                    min: [0, 0, 0],
                    max: [230, 240, 190],
                },
            },
            {
                identifier: standardLaserToolHead.identifier,
                configPath: 'laser/a250_1600mw',
                workRange: {
                    min: [0, 0, 0],
                    max: [252, 260, 235],
                },
                supportCameraCapture: true,
                runBoundaryModeOptions: [
                    {
                        label: 'Laser Spot',
                        value: JobOffsetMode.LaserSpot,
                    },
                ]
            },
            {
                identifier: highPower10WLaserToolHead.identifier,
                configPath: 'laser/a250_10w',
                workRange: {
                    min: [0, 0, 0],
                    max: [252, 260, 235],
                },
                supportCameraCapture: true,
                runBoundaryModeOptions: [
                    {
                        label: 'Laser Spot',
                        value: JobOffsetMode.LaserSpot,
                    },
                ]
            },
            {
                identifier: L20WLaserToolModule.identifier,
                configPath: 'laser/a250_20w',
                workRange: {
                    min: [0, 0, 0],
                    max: [252, 260, 0], // Correct this later
                },
                disableRemoteStartPrint: true,
                runBoundaryModeOptions: [
                    // {
                    //     label: 'Laser Spot',
                    //     value: JobOffsetMode.LaserSpot,
                    // },
                ]
            },
            {
                identifier: L40WLaserToolModule.identifier,
                configPath: 'laser/a250_40w',
                workRange: {
                    min: [0, 0, 0],
                    max: [252, 260, 0], // Correct this later
                },
                disableRemoteStartPrint: true,
                runBoundaryModeOptions: [
                    // {
                    //     label: 'Laser Spot',
                    //     value: JobOffsetMode.LaserSpot,
                    // },
                ]
            },
            {
                identifier: L2WLaserToolModule.identifier,
                configPath: 'laser/a250_2w', // 'laser/a350_2w',
                // workRange: {
                //     min: [0, 0, 0],
                //     max: [345, 357, 0], // Correct this later
                // },
                disableRemoteStartPrint: false,
                runBoundaryModeOptions: [
                    {
                        label: 'Crosshair',
                        value: JobOffsetMode.Crosshair,
                    }
                ]
            },
            {
                identifier: standardCNCToolHead.identifier,
                configPath: 'cnc/a250_standard',
            },
            {
                identifier: highPower200WCNCToolHead.identifier,
                configPath: 'cnc/200W',
            }
        ],

        modules: [
            {
                identifier: quickSwapKitModule.identifier,
                workRangeOffset: [0, -15, -15],
            },
            {
                identifier: bracingKitModule.identifier,
                workRangeOffset: [0, -12, -6],
            }
        ],

        slicerVersion: 0,
    },

    series: 'Snapmaker 2.0',
    seriesLabel: 'key-Luban/Machine/MachineSeries-A250',
    label: 'key-Luban/Machine/MachineSeries-Snapmaker 2.0 A250',
};
