import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import i18n from '../../../lib/i18n';
import { toFixed } from '../../../lib/numeric-utils';
import TipTrigger from '../../components/TipTrigger';
import SvgIcon from '../../components/SvgIcon';
import { DegreeInput, NumberInput as Input } from '../../components/Input';

import { actions as editorActions } from '../../../flux/editor';

import styles from './styles.styl';

/**
 * Transformation section.
 *
 * This component is used for display properties of selected SVG elements.
 */
class TransformationSection extends PureComponent {
    static propTypes = {
        // headType: PropTypes.string.isRequired, // laser | cnc

        size: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
            z: PropTypes.number
        }).isRequired,
        selectedElements: PropTypes.array,
        // element transformation
        selectedElementsTransformation: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
            scaleX: PropTypes.number.isRequired,
            scaleY: PropTypes.number.isRequired,
            angle: PropTypes.number.isRequired
        }),
        // element actions
        elementActions: PropTypes.shape({
            moveElementsImmediately: PropTypes.func.isRequired,
            resizeElementsImmediately: PropTypes.func.isRequired,
            flipElementsHorizontally: PropTypes.func.isRequired,
            flipElementsVertically: PropTypes.func.isRequired,
            rotateElementsImmediately: PropTypes.func.isRequired
        }),

        selectedModelArray: PropTypes.array,
        sourceType: PropTypes.string,
        transformation: PropTypes.shape({
            rotationZ: PropTypes.number,
            width: PropTypes.number,
            height: PropTypes.number,
            positionX: PropTypes.number,
            positionY: PropTypes.number,
            flip: PropTypes.number, // not used
            scaleX: PropTypes.number, // not used
            scaleY: PropTypes.number, // not used
            uniformScalingState: PropTypes.bool
        }),
        disabled: PropTypes.bool.isRequired,

        updateSelectedModelUniformScalingState: PropTypes.func.isRequired
    };

    state = {
    };

    actions = {

        onChangeLogicalX: (logicalX) => {
            const elements = this.props.selectedElements;
            const x = logicalX + this.props.size.x;
            this.props.elementActions.moveElementsImmediately(elements, { newX: x });
        },

        onChangeLogicalY: (logicalY) => {
            const elements = this.props.selectedElements;
            const y = -logicalY + this.props.size.y;
            this.props.elementActions.moveElementsImmediately(elements, { newY: y });
        },

        onChangeWidth: (newWidth) => {
            const elements = this.props.selectedElements;

            if (elements.length === 1) {
                // TODO: save uniformScalingState in SVGModel
                if (this.props.transformation.uniformScalingState) {
                    const { width, height, scaleX, scaleY } = this.props.selectedElementsTransformation;
                    const newHeight = height * Math.abs(scaleY) * (newWidth / width / Math.abs(scaleX));
                    this.props.elementActions.resizeElementsImmediately(elements, { newWidth, newHeight });
                } else {
                    this.props.elementActions.resizeElementsImmediately(elements, { newWidth });
                }
            }
        },
        onChangeHeight: (newHeight) => {
            const elements = this.props.selectedElements;

            if (elements.length === 1) {
                // TODO: save uniformScalingState in SVGModel
                if (this.props.transformation.uniformScalingState) {
                    const { width, height, scaleX, scaleY } = this.props.selectedElementsTransformation;
                    const newWidth = width * Math.abs(scaleX) * (newHeight / height / Math.abs(scaleY));
                    this.props.elementActions.resizeElementsImmediately(elements, { newWidth, newHeight });
                } else {
                    this.props.elementActions.resizeElementsImmediately(elements, { newHeight });
                }
            }
        },

        onChangeLogicalAngle: (logicalAngle) => {
            const newAngle = -logicalAngle;
            const elements = this.props.selectedElements;
            this.props.elementActions.rotateElementsImmediately(elements, { newAngle });
        },

        onFlipHorizontally: () => {
            const elements = this.props.selectedElements;
            this.props.elementActions.flipElementsHorizontally(elements);
        },

        onFlipVertically: () => {
            const elements = this.props.selectedElements;
            this.props.elementActions.flipElementsVertically(elements);
        },

        onChangeUniformScalingState: (uniformScalingState) => {
            this.props.updateSelectedModelUniformScalingState({ uniformScalingState });
        }
    };

    convertSVGPointToLogicalPoint(p, size) {
        return {
            x: p.x - size.x,
            y: -p.y + size.y
        };
    }

    render() {
        const { selectedElementsTransformation, size, selectedModelArray, sourceType, transformation, disabled } = this.props;

        const { x, y, width, height, scaleX, scaleY, angle } = selectedElementsTransformation;

        // calculate logical transformation
        // TODO: convert positions in flux
        const { x: logicalX, y: logicalY } = this.convertSVGPointToLogicalPoint({ x, y }, size);
        const logicalWidth = width * Math.abs(scaleX);
        const logicalHeight = height * Math.abs(scaleY);
        const logicalAngle = -angle;

        const { uniformScalingState = false } = transformation;

        const canResize = (sourceType !== 'text' && selectedModelArray.length === 1);
        const canRotate = (selectedModelArray.length === 1);

        const selectedNotHide = (selectedModelArray.length === 1) && selectedModelArray[0].visible || selectedModelArray.length > 1;
        const actions = this.actions;

        return (
            <div className="margin-vertical-8">
                <React.Fragment>
                    {/* X */}
                    <TipTrigger
                        title={i18n._('Move')}
                        content={i18n._('Set the coordinate of the selected object. You can also drag the object directly. The object should not be moved beyond work area.')}
                    >
                        <div className="sm-flex height-32 margin-vertical-8 ">
                            <span className="sm-flex-auto sm-flex-order-negative width-64">{i18n._('Move')}</span>
                            <span className="sm-flex-width sm-flex justify-space-between">
                                <div className="position-re sm-flex align-flex-start">
                                    <span className="width-16 height-32 display-inline unit-text align-c">
                                            X
                                    </span>
                                    <span>
                                        <Input
                                            suffix="mm"
                                            className="margin-horizontal-2"
                                            disabled={disabled || !selectedNotHide}
                                            value={toFixed(logicalX, 1)}
                                            size="small"
                                            min={-size.x}
                                            max={size.x}
                                            onChange={(value) => {
                                                actions.onChangeLogicalX(value);
                                            }}
                                        />
                                    </span>
                                </div>
                                <div className="position-re sm-flex align-flex-start">
                                    <span className="width-16 height-32 display-inline unit-text align-c">
                                            Y
                                    </span>
                                    <span>
                                        <Input
                                            suffix="mm"
                                            disabled={disabled || !selectedNotHide}
                                            className="margin-horizontal-2"
                                            value={toFixed(logicalY, 1)}
                                            size="small"
                                            min={-size.y}
                                            max={size.y}
                                            onChange={(value) => {
                                                actions.onChangeLogicalY(value);
                                            }}
                                        />
                                    </span>
                                </div>
                            </span>
                        </div>
                    </TipTrigger>
                    <TipTrigger
                        title={i18n._('Size')}
                        content={i18n._('Set the size of the selected object. You can also resize the object directly. The object should not exceed the work size.')}
                    >
                        <div className="sm-flex height-32 margin-vertical-8">
                            <span className="sm-flex-auto sm-flex-order-negative width-64">{i18n._('Size')}</span>
                            <div className="sm-flex-width sm-flex justify-space-between">
                                <div className="position-re sm-flex align-flex-start">
                                    <span className="width-16 height-32 display-inline unit-text align-c">
                                           W
                                    </span>
                                    <span>
                                        <Input
                                            suffix="mm"
                                            className="margin-horizontal-2"
                                            disabled={disabled || !selectedNotHide || canResize === false}
                                            value={toFixed(logicalWidth, 1)}
                                            min={1}
                                            size="small"
                                            max={size.x}
                                            onChange={(value) => {
                                                actions.onChangeWidth(value);
                                            }}
                                        />
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    disabled={disabled || !selectedNotHide || sourceType === 'raster'}
                                    className={classNames(
                                        uniformScalingState ? styles.icon_size_lock : styles.icon_size_unlock,
                                        'display-inline',
                                        // 'width-30',
                                        // 'height-30'
                                        'square-30'
                                    )}
                                    onClick={() => {
                                        actions.onChangeUniformScalingState(!uniformScalingState);
                                    }}
                                />
                                <div className="position-re sm-flex align-flex-start">
                                    <span className="width-16 height-32 display-inline unit-text align-c">
                                           H
                                    </span>
                                    <span>
                                        <Input
                                            suffix="mm"
                                            className="margin-horizontal-2"
                                            disabled={disabled || !selectedNotHide || canResize === false}
                                            value={toFixed(logicalHeight, 1)}
                                            min={1}
                                            max={size.y}
                                            size="small"
                                            onChange={(value) => {
                                                actions.onChangeHeight(value);
                                            }}
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </TipTrigger>
                    <TipTrigger
                        title={i18n._('Rotate')}
                        content={i18n._('Rotate the selected object to the angle you need.')}
                    >
                        <div className="sm-flex height-32 margin-vertical-8">
                            <span className="sm-flex-auto sm-flex-order-negative width-56">{i18n._('Rotate')}</span>
                            <div className="sm-flex-width sm-flex justify-space-between">
                                <div className="display-inline">
                                    <SvgIcon
                                        name="RotationAngle"
                                        type={['static']}
                                    />
                                    <DegreeInput
                                        disabled={disabled || !selectedNotHide || !canRotate}
                                        value={toFixed(logicalAngle, 1)}
                                        className="margin-horizontal-2"
                                        size="small"
                                        onChange={actions.onChangeLogicalAngle}
                                    />
                                </div>
                                <div className="sm-flex width-96 justify-space-between">
                                    {selectedModelArray.length === 1 && (
                                        <SvgIcon
                                            name="FlipLevel"
                                            className="padding-horizontal-8 border-radius-8 border-default-grey-1"
                                            disabled={disabled || !selectedNotHide}
                                            onClick={actions.onFlipHorizontally}
                                            // type={['static']}
                                            size={26}
                                            borderRadius={8}
                                        />
                                    )}
                                    {selectedModelArray.length === 1 && (
                                        <SvgIcon
                                            name="FlipVertical"
                                            className="padding-horizontal-8 border-radius-8 border-default-grey-1"
                                            disabled={disabled || !selectedNotHide}
                                            onClick={actions.onFlipVertically}
                                            size={26}
                                            borderRadius={8}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </TipTrigger>
                </React.Fragment>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const { headType } = ownProps;

    const machine = state.machine;
    const { modelGroup, SVGActions } = state[headType];

    const selectedElements = SVGActions.getSelectedElements();
    const selectedElementsTransformation = selectedElements.length === 0 ? {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0
    } : SVGActions.getSelectedElementsTransformation();

    const transformation = modelGroup.getSelectedModelTransformation();
    const selectedModelArray = modelGroup.getSelectedModelArray();

    const sourceType = (selectedModelArray.length === 1) ? selectedModelArray[0].sourceType : null;
    const visible = (selectedModelArray.length === 1) ? selectedModelArray[0].visible : null;

    return {
        size: machine.size,
        selectedElements,
        selectedElementsTransformation,
        selectedModelArray,
        sourceType,
        visible,
        transformation,
        modelGroup
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { headType } = ownProps;

    return {
        elementActions: {
            moveElementsImmediately: (elements, options) => dispatch(editorActions.moveElementsImmediately(headType, elements, options)),
            resizeElementsImmediately: (elements, options) => dispatch(editorActions.resizeElementsImmediately(headType, elements, options)),
            flipElementsHorizontally: (elements, options) => dispatch(editorActions.flipElementsHorizontally(headType, elements, options)),
            flipElementsVertically: (elements, options) => dispatch(editorActions.flipElementsVertically(headType, elements, options)),
            rotateElementsImmediately: (elements, options) => dispatch(editorActions.rotateElementsImmediately(headType, elements, options))
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TransformationSection);