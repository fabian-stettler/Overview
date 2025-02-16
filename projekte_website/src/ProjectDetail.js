import React from 'react';
import { useParams } from 'react-router-dom';
import './styles.css';
// Import der Bilder
import PublicationHeatMap from './images/PublicationHeatMap.png';
import DockerArchitectureOverview from './images/Docker Architecture Overview.png'
import KeywordNetwork from './images/KeywordNetwork.png'
import VisualisierungBenutzterSysteme from './images/VisualisierungBenutzterSysteme.png'
import MongoDBSchema from './images/MongoDBSchema.png'
import SentimentAnalysis from './images/SentimentAnalysis.png'
import AspectOverTime from './images/aspectAnalysisByTime.png'
import AuthorOverTime from './images/AuthorNachTimeline.png'

const projects = [
    { id: 1,
    name: 'Datamining SRF',
    description: 'This is my first datamining project where I extracted data from www.srf.ch a swiss news site and then systematically analyzed the data.',
    htmlFile: "/network_graph.html",
    //htmlFile: "index.html",
    sourceCodeLink: "https://github.com/fabian-stettler/DataMining",
    content: [
        { type: 'title', content: 'Docker Container Overview' },
        { type: 'text', content: 'Here is an overview of the data analysis process and all the docker containers involved. I used Docker because of portability reasons, I developed the software on my laptop but I run it on my raspberry PI.' },
        { type: 'image', src: DockerArchitectureOverview, caption: 'Data Analysis Overview' },
        { type: 'title', content: 'Heat Map Article Publication Time' },
        { type: 'text', content: 'A first use case does analyze the publication times of all articles published on www.srf.ch . There are 24 x 7 time slots and all articles are matched to one time slot. The more yellow the '
                + 'time slot is, the more article got published in this time slot. It allows for a specific analysis of publication time of this news site.'},
        { type: 'image', src: PublicationHeatMap, caption: 'Heatmap of article Publication Times' },
        { type: 'title', content: 'Sentiment Analysis with AI' },
        { type: 'text', content: 'I also tried a sentiment analysis with specific keywords and compared them to others to maybe find a bias of the newspaper. ' +
                'For this I searched all paragraphs within all articles if they would contain a keyword. Once a paragraph does contain the keyword, I classify the paragraph with the help of an external AI model.' +
                'The model then classifies the paragraph as negative, neutral or positive and provides a confidence score. In the analysis only paragraphs with a confidence score higher than .9 are included. ' },
        { type: 'image', src: SentimentAnalysis, caption: '' },
        { type: 'title', content: 'Aspect Analysis over Time' },
        { type: 'text', content: 'This plot shows the amount and development over time of specific aspects or keywords.'},
        { type: 'image', src: AspectOverTime, caption: 'This is a plot of the keywords (Demokraten, Republikaner)'},
        { type: 'title', content: 'Specific Author Publication over time'},
        { type: 'text', content: 'This function is able to display all the articles of a specific author over time. With this function you\'re able to target a specific author and his or here publications.'},
        { type: 'image', src: AuthorOverTime , caption: 'This is a picture of the srf keyword Map'},
        { type: 'title', content: 'Keyword Map' },
        { type: 'text', content: 'This html file shows a keyword map of all keywords mapped to all saved articles. '
                + 'The bigger the bubble, the more the keyword was mentioned in all the articles. If there is a connection between two bubbles, that means two keywords where often within the same article.' +
                'For a connection to materialize a certain threshold must be reached.'},
        { type: 'image', src: KeywordNetwork, caption: 'This is a picture of the srf keyword Map'},
        ]
    },
    { id: 2,
        name: 'Database Decision Support System',
        description: 'This is a project which provides decision support on the basis of data.' +
            ' The user should be supported in his decision making process with the underlying MongoDB and SQL databases. ' +
            'This project was aimed at helping football clubs finding optimal new signings, game analysis of opponents and tactics.',
        content: [
            { type: 'title', content: 'System Architecture' },
            { type: 'text', content: 'This picture provides an overview of the systems used to realize this project' },
            { type: 'image', src: VisualisierungBenutzterSysteme, caption: 'Overview of the system architecture' },
            { type: 'title', content: 'MongoDB Document Structure' },
            { type: 'text', content: 'An example of the MongoDB Document Archtiecture used for the project.' },
            { type: 'image', src: MongoDBSchema, caption: 'This is an image of the MongoDB Schema' },
            { type: 'title', content: 'Visualization with Metabase'},
            { type: 'text', content: 'This is the visualization of the decision support system with Metabase' }

        ],
    pdf: 'Datamining_Arbeit.pdf'
    },
    {
        id: 3,
        name: 'Project 3',
        description: 'This is a project that was done in context of the module VSK (distributed systems) at HSLU.' +
            ' The project was about a distributed logging system which enables logging via tcp from multiple clients to a central server. ' +
            'It also includes a logger viewer which allows for a visual representation of the logged data at the server.',
        content: [
            { type: 'title', content: 'Project 3' },
            { type: 'text', content: 'This is a project description' },
        ]
    }
];



function ProjectDetail() {
    //useParams() liefert den dynamischen Teil des momentanten Pfades, also (1, 2, 3)
    const { id } = useParams();
    const project = projects.find((project) => project.id === parseInt(id));

    if (!project) {
        return <div>Project not found 2</div>;
    }

    return (
        <div>
            <h1>{project.name}</h1>
                <ul>
                    <li>
                        <p>{project.description}</p>
                    </li>
                    <li>
                        <div className="project-content">
                            {project.content.map((item, index) => {
                                if (item.type === 'image') {
                                    return (
                                        <div key={index} className="project-image-container">
                                            <img
                                                src={item.src}
                                                alt={item.caption}
                                                className="project-image"
                                            />
                                            <p className="project-image-caption">{item.caption}</p>
                                        </div>
                                    );
                                } else if (item.type === 'text') {
                                    return (
                                        <p key={index} className="project-text">{item.content}</p>
                                    );
                                }
                                else if (item.type === 'title') {
                                    return (
                                        <p key={index} className="project-subtitles">{item.content}</p>
                                    );
                                }
                                else {
                                    return null;
                                }
                            })}
                            {project.pdf && (
                                <a href={`${process.env.PUBLIC_URL}/Datamining_Arbeit.pdf`}>
                                    See the whole paper
                                </a>
                            )}
                            {project.htmlFile && (
                                <a href={`${process.env.PUBLIC_URL}/network_graph.html`}
                                    download="network_graph.html">
                                    get the whole graph
                                </a>
                            )}
                            {project.sourceCodeLink && (
                                <a href={project.sourceCodeLink} target="_blank" rel="noopener noreferrer">
                                    View source code
                                </a>
                            )}

                        </div>
                    </li>
                </ul>


        </div>
    );
}

export default ProjectDetail;
