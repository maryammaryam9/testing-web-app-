import React from 'react';
import '../SideBar/sidebar.scss';
import { useSelector } from 'react-redux';
import useGA4DataLayer from '../../hooks/useGA4DataLayer';

const SideBar = (props) => {
    const recentHistoryPanelStatus = useSelector((state) => state.header.isRecentHistoryPanelOpen);

    // Function to remove GMT and parse the date
    const parseDateWithoutGMT = (timestamp) => {
        return new Date(timestamp.replace('GMT', '').trim());
    };

    // Sorting Array with latest at top
    const sortedArrayWithLatest = props.data
        .map((item) => ({
            ...item,
            adjusted_date: parseDateWithoutGMT(item.last_updated_at),
        }))
        .sort((d1, d2) => d2.adjusted_date.getTime() - d1.adjusted_date.getTime());

    // Function to format the date
    const formatDate = sortedArrayWithLatest.map((item) => {
        const date = item.adjusted_date;
        const dateOption = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of the day

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let keyValueOfDate = '';
        if (date.toDateString() === today.toDateString()) {
            keyValueOfDate = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            keyValueOfDate = 'Yesterday';
        }

        const formattedDate = date.toLocaleDateString('en-GB', dateOption);
        const temp = {
            ...item,
            new_date: keyValueOfDate ? `${keyValueOfDate} ${formattedDate}` : formattedDate,
        };
        return temp;
    });

    // Function to create a new array grouped by date
    const newGroupAndCollectSameDateItem = formatDate.reduce((acc, elem) => {
        (acc[elem.new_date] ??= []).push(elem);
        return acc;
    }, {});

    // DataLayer start
    const datalayerGA4 = useGA4DataLayer()
    const handleDataLayerGA4 = (dataLayerObj) => {
        datalayerGA4.setAllData(dataLayerObj);
    };

  // DataLayer end 

    return (
        <div className={`sidebar ${recentHistoryPanelStatus ? 'open' : ''}`}>
            <div className="history">
                <div className="history">
                    {Object.keys(newGroupAndCollectSameDateItem).map((item) => (
                        <React.Fragment key={`history_${item}`}>
                            <h3 className="history-title">{item}</h3>
                            <ol className="history-list">
                                {newGroupAndCollectSameDateItem[item].map((subItem, subindex) => (
                                    <li
                                        className="history-item"
                                        key={subindex}
                                        onClick={() => {
                                            props.handelLink(subItem.title, subItem.chat_id);
                                            // handleDataLayerGA4({
                                            //     event: "prompt_interaction",
                                            //     destination_page_url: "NA",
                                            //     field_name:"Open Research",
                                            //     field_selection: item,
                                            //     field_type: subItem.title,
                                            //   });
                                              handleDataLayerGA4({
                                                event: "prompt_submit",
                                                destination_page_url: '/open-search-chat',
                                                section: "Open Research",
                                                click_text: "submit",
                                                tool_type: item,
                                                tool_subtype: subItem.title,
                                                topic_text:"NA",
                                                topic_text1:"NA",
                                                topic_text2:"NA",
                                                header_element: "NA",
                                                prompt_count: "NA"
                                              });
                                        }}
                                    >
                                        <a href={subItem.link} className="history-link">
                                            {subItem.title}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SideBar;