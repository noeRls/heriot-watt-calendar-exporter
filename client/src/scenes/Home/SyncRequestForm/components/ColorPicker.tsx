import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, makeStyles, createStyles } from '@material-ui/core';
import { noop } from 'services/utils';

interface ColorPickerProps {
    onChange: (colorId: number) => void;
    defaultColor?: string;
}

const useStyles = makeStyles(() =>
    createStyles({
        formControl: {
            width: 200,
        },
        renderValueContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        colorPreview: {
            width: '20px',
            height: '20px',
            borderRadius: 2,
            paddingLeft: '10px',
            paddingRight: '10px',
            backgroundClip: 'content-box',
        },
    }),
);

interface Color {
    [key: string]: {
        name: string;
        color: string;
    };
}

export const initialColorId = 0;

export const ColorPicker = ({ onChange = noop, defaultColor }: ColorPickerProps) => {
    const style = useStyles();
    const colors: Color = {
        '1': { name: 'Lavender', color: '#7986cb' },
        '2': { name: 'Sage', color: '#33b679' },
        '3': { name: 'Grape', color: '#8e24aa' },
        '4': { name: 'Flamingo', color: '#e67c73' },
        '5': { name: 'Banana', color: '#f6c026' },
        '6': { name: 'Tangerine', color: '#f5511d' },
        '7': { name: 'Peacock', color: '#039be5' },
        '8': { name: 'Graphite', color: '#616161' },
        '9': { name: 'Blueberry', color: '#3f51b5' },
        '10': { name: 'Basil', color: '#0b8043' },
        '11': { name: 'Tomato', color: '#d60000' },

        get '0'() {
            if (defaultColor === undefined) {
                return { name: 'Default', color: '#ffffff' };
            }
            return { name: 'Default', color: defaultColor };
        },
    };

    return (
        <div>
            <FormControl className={style.formControl} disabled={defaultColor === undefined}>
                <InputLabel id="demo-simple-select-label">Color</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    defaultValue={initialColorId}
                    onChange={(e) => onChange(e.target.value as number)}
                    renderValue={(id) => {
                        const color = colors[(id as number).toString()];
                        return (
                            <div className={style.renderValueContainer}>
                                <div className={style.colorPreview} style={{ backgroundColor: color?.color }} />
                                {color?.name}
                            </div>
                        );
                    }}
                >
                    {Object.entries(colors).map(([id, color]: [string, { name: string; color: string }]) => (
                        <MenuItem key={id} value={id}>
                            <div className={style.colorPreview} style={{ backgroundColor: color.color }} />
                            {color.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};
