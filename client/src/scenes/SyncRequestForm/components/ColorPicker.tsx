import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, makeStyles, createStyles } from '@material-ui/core';

interface ColorPickerProps {
    onChange: (colorId: number) => void;
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
            backgroundClip: 'content-box',
        }
    }),
);

interface Color {
    id: number;
    name: string;
    color: string;
}

export const ColorPicker = ({ onChange = () => { } }: ColorPickerProps) => {
    const style = useStyles();
    const colors: Color[] = [
        { id: 1, name: 'Lavender', color: '#7986cb' },
        { id: 2, name: 'Sage', color: '#33b679' },
        { id: 3, name: 'Grape', color: '#8e24aa' },
        { id: 4, name: 'Flamingo', color: '#e67c73' },
        { id: 5, name: 'Banana', color: '#f6c026' },
        { id: 6, name: 'Tangerine', color: '#f5511d' },
        { id: 7, name: 'Peacock', color: '#039be5' },
        { id: 8, name: 'Graphite', color: '#616161' },
        { id: 9, name: 'Blueberry', color: '#3f51b5' },
        { id: 1, name: 'Basil', color: '#0b8043' },
        { id: 1, name: 'Tomato', color: '#d60000' },
    ];

    return (
        <div>
            <FormControl className={style.formControl}>
                <InputLabel id="demo-simple-select-label">Color</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    defaultValue={7}
                    onChange={(e) => onChange(e.target.value as number)}
                    renderValue={(id) => {
                        const color = colors.find(color => color.id === id);
                        return (
                            <div className={style.renderValueContainer}>
                                {color?.name}
                                <div className={style.colorPreview} style={{ backgroundColor: color?.color }} />
                            </div>
                        )
                    }}
                >
                    {colors.map(color => (
                        <MenuItem key={color.id} value={color.id}>
                            {color.name}
                            <div className={style.colorPreview} style={{ backgroundColor: color.color }} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}