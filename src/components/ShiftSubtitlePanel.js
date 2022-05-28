import React, {Component} from 'react';
import path from 'path';

import './PlayerExportPanel.css';
import './ShiftSubtitle.css';

const fs = window.require('fs-extra');

export default class ShiftSubtitlePanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            exporting: false,
            statusMessage: '',
            shiftInSeconds: '00',
            startPointMinutes: '00',
            startPointSeconds: '00',
            inputError: false
        };
    }

    componentDidMount() {
        document.body.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.body.removeEventListener('keydown', this.handleKeyDown);
    }

    calculateTimestamp = (pos_real) => {
        const hrs = Math.floor(pos_real / (60 * 60));
        pos_real -= hrs * 60 * 60;
        const mnts = Math.floor(pos_real / 60);
        pos_real -= mnts * 60;
        const secs = Math.floor(pos_real);

        let time_stamp = "";
        time_stamp += ("00" + hrs).slice(-2) + ":";
        time_stamp += ("00" + mnts).slice(-2) + ":";
        time_stamp += ("00" + secs).slice(-2) + ",";
        time_stamp += ("00" + pos_real).slice(-3);

        return time_stamp;
    }

    calculateStartPointSeconds = (startPointMinutes, startPointSeconds) => {
        return parseFloat(startPointMinutes)*60 + parseFloat(startPointSeconds);
    }

    joinChunkToSubtitleData(chunks, startTime, shiftTime) {
        let data = "";
        let counter = 1;
        for (const chunk of chunks) {
            var pos_real = chunk.position.begin;
            var pos_real_end = chunk.position.end;

            if (startTime < pos_real) {
                pos_real += shiftTime;
                pos_real_end += shiftTime;
            }

            let time_stamp = this.calculateTimestamp(pos_real);
            let next_time_stamp = this.calculateTimestamp(pos_real_end);

            data +=
                counter + "\n" +
                time_stamp + " --> " + next_time_stamp + "\n" +
                chunk.annoText.text + "\n\n";

            counter++;
        }

        return data;
    }

    handleShifting = async () => {
        const chunks = this.props.orderedSubtitleTracks[0].chunkSet.sortedChunks;
        const startTime = this.calculateStartPointSeconds(this.state.startPointMinutes, this.state.startPointSeconds)
        const shiftTime = parseFloat(this.state.shiftInSeconds);
        const subtitleName = this.props.title+".srt"
        const subtitleBaseDirectoryPath = this.props.subtitleInfo.get(subtitleName);
        const subtitlePath = path.join(subtitleBaseDirectoryPath, subtitleName);

        console.log(`Start shifting subtitles with startTime=${startTime}s and shiftTime=${shiftTime}`);

        const backupSubtitleDirectory = subtitleBaseDirectoryPath+`/backups/${subtitleName}.backup`;
        if (!fs.existsSync(backupSubtitleDirectory)) {
            fs.copy(subtitlePath, backupSubtitleDirectory);
            console.log("backup is created for file: " + subtitlePath);
        }

        const subtitleData = this.joinChunkToSubtitleData(chunks, startTime, shiftTime);
        fs.writeFile(subtitlePath, subtitleData, function (err) {
            if (err) throw err;
            console.log('File is updated successfully.');
        });

        console.log(`Subtitle shift is ended with startTime=${startTime}s, and shiftTime=${shiftTime}`);

        this.props.onDone();
    };

    handleShiftInSeconds(evt) {
        let shiftInSeconds = (evt.target.validity.valid) ? evt.target.value : this.returnZeroIfNan(this.state.shiftInSeconds);
        this.setState({shiftInSeconds});
    }

    handleStartPointMinutes(evt) {
        const startPointMinutes = (evt.target.validity.valid) ? evt.target.value : this.returnZeroIfNan(this.state.startPointMinutes);
        this.setState({startPointMinutes});
    }

    handleStartPointSeconds(evt) {
        const startPointSeconds = (evt.target.validity.valid) ? evt.target.value : this.returnZeroIfNan(this.state.startPointSeconds);
        this.setState({startPointSeconds});
    }

    returnZeroIfNan = (value) => { return value.isNaN ? "00" : value; };

    handleDone = () => {
        if (this.state.shiftSubtitle) {
            return;
        }

        this.props.onDone();
    };

    render() {
        const {ankiPrefs} = this.props;

        const configured = (ankiPrefs.modelName && ankiPrefs.deckName && ankiPrefs.fieldMap);

        return (
            <div className="ShiftSubtitlePanel">
                <div className="ShiftSubtitlePanel-buttons">
                    <div>
                        <button onClick={this.handleShifting} disabled={this.state.shiftSubtitle || !configured}>Shift subtitles</button>
                        {' '}
                        <button onClick={this.handleDone} disabled={this.state.shiftSubtitle}>Cancel [esc]</button>
                        <br/>
                    </div>
                    <div className="ShiftSubtitlePanel-status-message">{this.state.statusMessage}</div>
                </div>
                <div className="ShiftSubtitlePanel-header">Shifting subtitles</div>
                <div>There is setting for shifting subtitle.</div>
                <div key={"startTime"} className="ShiftSubtitle-field-start-time">
                    <div className="ShiftSubtitle-field-value">
                        <label>{"Start time in:"}</label>
                    </div>
                    <div className="ShiftSubtitle-field-value">
                        <input type="text"
                               pattern="[0-9]*"
                               onInput={this.handleStartPointMinutes.bind(this)}
                               value={this.state.startPointMinutes}/>
                        <label>{"min"}</label>
                    </div>
                    <div className="ShiftSubtitle-field-value">
                        <input type="text"
                               pattern="[0-9]*"
                               onInput={this.handleStartPointSeconds.bind(this)}
                               value={this.state.startPointSeconds}/>
                        <label>{"sec"}</label>
                    </div>
                </div>
                <div key={"shiftTime"} className="ShiftSubtitle-field-shift-time">
                    <div className="ShiftSubtitle-field-value">
                        <label>{"Shift time in seconds:"}</label>
                    </div>
                    <div className="ShiftSubtitle-field-value">
                        <input type="text"
                               pattern="[0-9]*"
                               onChange={this.handleShiftInSeconds.bind(this)}
                               value={this.state.shiftInSeconds}/>
                        <label>{"sec"}</label>
                    </div>
                </div>
            </div>
        );
    }
}
