import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TipTrigger from '../../components/TipTrigger';
import Switch from '../../components/Switch';
import { actions as machineActions } from '../../../flux/machine';
import i18n from '../../../lib/i18n';
import log from '../../../lib/log';


class Enclosure extends PureComponent {
    static propTypes = {
        executeGcode: PropTypes.func.isRequired,
        enclosureLight: PropTypes.number.isRequired,
        headType: PropTypes.string,
        enclosureFan: PropTypes.number.isRequired,
        isConnected: PropTypes.bool.isRequired,
        connectionType: PropTypes.string.isRequired,
        server: PropTypes.object.isRequired
    }

    state = {
        led: 0,
        fan: 0,
        isLedReady: true,
        isFanReady: true,
        isDoorEnabled: true
    }

    actions = {
        onHandleLed: async () => {
            let led;
            if (this.state.led === 0) {
                led = 100;
            } else {
                led = 0;
            }
            if (this.props.connectionType === 'wifi') {
                this.props.server.setEnclosureLight(led, (errMsg, res) => {
                    if (errMsg) {
                        log.error(errMsg);
                        return;
                    }
                    if (res) {
                        this.setState({
                            ...this.state,
                            led: res.led
                        });
                    }
                });
            } else {
                await this.props.executeGcode(`M1010 S3 P${led};`);
                this.setState({
                    ...this.state,
                    isLedReady: false
                });
            }
        },
        onHandleCoolingFans: async () => {
            let fan;
            if (this.state.fan === 0) {
                fan = 100;
            } else {
                fan = 0;
            }
            if (this.props.connectionType === 'wifi') {
                this.props.server.setEnclosureFan(fan, (errMsg, res) => {
                    if (errMsg) {
                        log.error(errMsg);
                        return;
                    }
                    if (res) {
                        this.setState({
                            ...this.state,
                            fan: res.fan
                        });
                    }
                });
            } else {
                await this.props.executeGcode(`M1010 S4 P${fan};`);
                this.setState({
                    ...this.state,
                    isFanReady: false
                });
            }
        },
        onHandleDoorEnabled: () => {
            const isDoorEnabled = !this.state.isDoorEnabled;
            this.props.server.setDoorDetection(isDoorEnabled, (errMsg, res) => {
                if (errMsg) {
                    log.error(errMsg);
                    return;
                }
                if (res) {
                    this.setState({
                        ...this.state,
                        isDoorEnabled: res.isDoorEnabled
                    });
                }
            });
        }
    }

    componentDidMount() {
        if (this.props.isConnected && this.props.connectionType === 'wifi') {
            this.props.server.getEnclosureStatus((errMsg, res) => {
                if (errMsg) {
                    log.warn(errMsg);
                } else {
                    const { isDoorEnabled, led, fan } = res;
                    this.setState({
                        isDoorEnabled,
                        led,
                        fan
                    });
                }
            });
        }
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.enclosureLight !== this.props.enclosureLight && this.props.connectionType === 'serial') {
            this.setState({
                led: nextProps.enclosureLight,
                isLedReady: true
            });
        }
        if (nextProps.enclosureFan !== this.props.enclosureFan
            && this.props.connectionType === 'serial') {
            this.setState({
                fan: nextProps.enclosureFan,
                isFanReady: true
            });
        }
        if (nextProps.isConnected && this.props.connectionType === 'wifi') {
            this.props.server.getEnclosureStatus((errMsg, res) => {
                if (errMsg) {
                    log.warn(errMsg);
                } else {
                    const { isDoorEnabled, led, fan } = res;
                    this.setState({
                        isDoorEnabled,
                        led,
                        fan
                    });
                }
            });
        }
    }

    render() {
        const { isDoorEnabled, led, fan, isLedReady, isFanReady } = this.state;
        const { isConnected, connectionType, headType } = this.props;

        return (
            <div>
                <div className="margin-bottom-8">
                    <div className="sm-flex justify-space-between margin-vertical-8">
                        <span>{i18n._('LED Strips')}</span>
                        <Switch
                            onClick={this.actions.onHandleLed}
                            checked={led}
                            disabled={(connectionType === 'serial' && !isLedReady) || !isConnected}
                        />
                    </div>
                    <div className="sm-flex justify-space-between margin-vertical-8 ">
                        <span>{i18n._('Exhaust Fan')}</span>
                        <Switch
                            onClick={this.actions.onHandleCoolingFans}
                            checked={Boolean(fan)}
                            disabled={(connectionType === 'serial' && !isFanReady) || !isConnected}
                        />
                    </div>
                    { (isConnected && connectionType === 'wifi' && headType !== '3dp') && (
                        <TipTrigger
                            title={i18n._('Door Detection')}
                            content={(
                                <div>
                                    <p>{i18n._('If you disable the Door Detection feature, your job will not pause when one of both of the enclosure panels is/are opened.')}</p>
                                </div>
                            )}
                        >
                            <div className="sm-flex justify-space-between margin-vertical-8 ">
                                <span>{i18n._('Door Detection')}</span>
                                <Switch
                                    onClick={this.actions.onHandleDoorEnabled}
                                    checked={isDoorEnabled}
                                    disabled={(connectionType === 'serial' && !isFanReady) || !isConnected}
                                />
                            </div>
                        </TipTrigger>
                    )}
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    const { server, isConnected, headType, connectionType, enclosureLight, enclosureFan } = state.machine;

    return {
        headType,
        enclosureLight,
        enclosureFan,
        isConnected,
        connectionType,
        server
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        executeGcode: (gcode, context) => dispatch(machineActions.executeGcode(gcode, context))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Enclosure);