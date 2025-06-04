import React, { useState } from 'react';
import Nav from '../components/Nav';
import './MakeSchedule.css';

const MakeSchedule = () => {
  const [mainTask, setMainTask] = useState({
    name: '',
    totalDuration: { hh: '', mm: '', ss: '' },
  });

  const [subTasks, setSubTasks] = useState([
    {
      name: '',
      duration: { hh: '', mm: '', ss: '' },
    },
  ]);

  const handleMainTaskNameChange = (e) => {
    const { value } = e.target;
    setMainTask((prevTask) => ({
      ...prevTask,
      name: value,
    }));
  };

  const handleMainTaskDurationChange = (e) => {
    const { name, value } = e.target;
    setMainTask((prevTask) => ({
      ...prevTask,
      totalDuration: {
        ...prevTask.totalDuration,
        [name]: value,
      },
    }));
  };

  const handleSubTaskNameChange = (index, e) => {
    const { value } = e.target;
    const newSubTasks = [...subTasks];
    newSubTasks[index].name = value;
    setSubTasks(newSubTasks);
  };

  const handleSubTaskDurationChange = (index, e) => {
    const { name, value } = e.target;
    const newSubTasks = [...subTasks];
    newSubTasks[index].duration = {
      ...newSubTasks[index].duration,
      [name]: value,
    };
    setSubTasks(newSubTasks);
  };

  const addSubTask = () => {
    setSubTasks((prevSubTasks) => [
      ...prevSubTasks,
      { name: '', duration: { hh: '', mm: '', ss: '' } },
    ]);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    console.log('Main Task:', mainTask);
    console.log('Sub Tasks:', subTasks);
    alert('Schedule data logged to console. Backend will process hh/mm/ss!');
  };

  return (
    <div>
      <Nav />
      <div className="make-schedule-page-content">
        <div className="form-container">
          <h2 className="form-heading">Create Schedule</h2>
          <form onSubmit={handleSaveSchedule}>
            {/* Main Task Name and Total Duration on one line */}
            <div className="input-group-row">
              <div className="input-field-half">
                <label htmlFor="taskName">Task Name / Purpose:</label>
                <input
                  type="text"
                  id="taskName"
                  name="name"
                  value={mainTask.name}
                  onChange={handleMainTaskNameChange}
                  className="form-input"
                  placeholder="e.g., Inter-house Sports Event"
                  required
                />
              </div>
              <div className="input-field-half">
                <label>Total Duration (HH : MM : SS):</label>
                <div className="time-inputs-group">
                  <input
                    type="number"
                    name="hh"
                    value={mainTask.totalDuration.hh}
                    onChange={handleMainTaskDurationChange}
                    className="form-input time-input"
                    placeholder="HH"
                    min="0"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    name="mm"
                    value={mainTask.totalDuration.mm}
                    onChange={handleMainTaskDurationChange}
                    className="form-input time-input"
                    placeholder="MM"
                    min="0"
                    max="59"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    name="ss"
                    value={mainTask.totalDuration.ss}
                    onChange={handleMainTaskDurationChange}
                    className="form-input time-input"
                    placeholder="SS"
                    min="0"
                    max="59"
                  />
                </div>
              </div>
            </div>

            <hr className="bold-hr" />

            {/* Sub-Tasks Section */}
            <h3 className="sub-heading">Breakdown of Units:</h3>
            {subTasks.map((subTask, index) => (
              <div key={index} className="sub-task-item">
                <div className="input-group-row">
                  <div className="input-field-half">
                    <label>Sub-Task {index + 1} Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={subTask.name}
                      onChange={(e) => handleSubTaskNameChange(index, e)}
                      className="form-input"
                      placeholder="e.g., Running"
                      required
                    />
                  </div>
                  <div className="input-field-half">
                    <label>Allocated Time (HH : MM : SS):</label>
                    <div className="time-inputs-group">
                      <input
                        type="number"
                        name="hh"
                        value={subTask.duration.hh}
                        onChange={(e) => handleSubTaskDurationChange(index, e)}
                        className="form-input time-input"
                        placeholder="HH"
                        min="0"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        name="mm"
                        value={subTask.duration.mm}
                        onChange={(e) => handleSubTaskDurationChange(index, e)}
                        className="form-input time-input"
                        placeholder="MM"
                        min="0"
                        max="59"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        name="ss"
                        value={subTask.duration.ss}
                        onChange={(e) => handleSubTaskDurationChange(index, e)}
                        className="form-input time-input"
                        placeholder="SS"
                        min="0"
                        max="59"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={addSubTask} className="plus-button" title="Add another sub-task">
              +
            </button>

            <hr className="bold-hr" />

            <div className="save-button-container">
              <button type="submit" className="save-button">
                Save Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MakeSchedule;