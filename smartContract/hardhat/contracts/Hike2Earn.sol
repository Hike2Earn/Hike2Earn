// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Hike2Earn - Mountain Climbing NFT Rewards System
 * @dev A decentralized platform for mountain climbing campaigns with NFT rewards and prize pools
 * @author Your Name
 */
contract Hike2Earn is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeERC20 for IERC20;
    
    Counters.Counter private _tokenIds;
    
    // ============ STRUCTS ============
    
    /// @dev Represents a mountain available for climbing
    struct Mountain {
        string name;
        uint256 altitude;           // Altitude in meters
        string location;
        bool isActive;
        uint256 campaignId;         // Which campaign this mountain belongs to
    }
    
    /// @dev Represents a climbing achievement NFT
    struct ClimbingNFT {
        uint256 mountainId;
        address climber;
        uint256 climbDate;          // Timestamp of the climb
        string mountainName;        // Cached for easy access
        uint256 altitude;           // Cached for easy access
        bool verified;              // Admin verification status
    }
    
    /// @dev Represents a campaign with its own prize pool
    struct Campaign {
        string name;
        uint256 startDate;
        uint256 endDate;
        uint256 prizePoolETH;       // ETH prize pool
        mapping(address => uint256) prizePoolERC20; // ERC20 token prize pools
        address[] erc20Tokens;      // Supported ERC20 tokens
        uint256[] mountainIds;      // Mountains included in this campaign
        address[] participants;     // NFT holders in this campaign
        mapping(address => bool) hasNFT; // Track if participant has NFT
        bool isActive;
        bool prizeDistributed;      // Prevent double distribution
        uint256 totalNFTsMinted;    // Total NFTs minted for this campaign
    }
    
    /// @dev Sponsor information
    struct Sponsor {
        string name;
        address sponsorAddress;
        uint256 totalContributed;  // Total ETH contributed across all campaigns
        string logoURI;
        bool isActive;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Mountain) public mountains;
    mapping(uint256 => ClimbingNFT) public climbingNFTs;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => Sponsor) public sponsors;
    mapping(address => uint256[]) public participantNFTs; // Participant's NFT IDs
    mapping(uint256 => mapping(address => bool)) public campaignParticipants; // campaignId => participant => hasNFT
    
    uint256 public mountainCount;
    uint256 public campaignCount;
    uint256 public nftCount;
    
    // Constants
    uint256 public constant VERIFICATION_PERIOD = 7 days;
    
    // ============ EVENTS ============
    
    /// @dev Emitted when a new NFT is minted for a mountain climb
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed climber,
        uint256 indexed campaignId,
        string mountainName,
        uint256 altitude,
        uint256 climbDate
    );
    
    /// @dev Emitted when sponsors fund the prize pool
    event PrizePoolFunded(
        uint256 indexed campaignId,
        address indexed sponsor,
        address token, // address(0) for ETH
        uint256 amount
    );
    
    /// @dev Emitted when prizes are distributed to participants
    event PrizeDistributed(
        uint256 indexed campaignId,
        address indexed participant,
        address token, // address(0) for ETH
        uint256 amount
    );
    
    event CampaignCreated(uint256 indexed campaignId, string name, uint256 startDate, uint256 endDate);
    event MountainAdded(uint256 indexed mountainId, string name, uint256 altitude, uint256 indexed campaignId);
    event SponsorRegistered(address indexed sponsor, string name);
    event NFTVerified(uint256 indexed tokenId, address indexed climber);
    
    // ============ CONSTRUCTOR ============
    
    constructor() ERC721("Hike2Earn Climbing NFT", "H2E") {}
    
    // ============ CAMPAIGN MANAGEMENT ============
    
    /**
     * @dev Creates a new climbing campaign
     * @param _name Campaign name
     * @param _startDate Campaign start timestamp
     * @param _endDate Campaign end timestamp
     */
    function createCampaign(
        string memory _name,
        uint256 _startDate,
        uint256 _endDate
    ) external onlyOwner returns (uint256) {
        require(_startDate < _endDate, "Invalid campaign dates");
        require(_startDate >= block.timestamp, "Campaign must start in the future");
        
        uint256 campaignId = campaignCount;
        Campaign storage campaign = campaigns[campaignId];
        
        campaign.name = _name;
        campaign.startDate = _startDate;
        campaign.endDate = _endDate;
        campaign.isActive = true;
        campaign.prizeDistributed = false;
        campaign.totalNFTsMinted = 0;
        
        campaignCount++;
        
        emit CampaignCreated(campaignId, _name, _startDate, _endDate);
        return campaignId;
    }
    
    // ============ MOUNTAIN MANAGEMENT ============
    
    /**
     * @dev Adds a new mountain to a specific campaign
     * @param _campaignId Campaign ID to add mountain to
     * @param _name Mountain name
     * @param _altitude Mountain altitude in meters
     * @param _location Mountain location
     */
    function addMountain(
        uint256 _campaignId,
        string memory _name,
        uint256 _altitude,
        string memory _location
    ) external onlyOwner {
        require(_campaignId < campaignCount, "Campaign does not exist");
        require(campaigns[_campaignId].isActive, "Campaign is not active");
        
        uint256 mountainId = mountainCount;
        
        mountains[mountainId] = Mountain({
            name: _name,
            altitude: _altitude,
            location: _location,
            isActive: true,
            campaignId: _campaignId
        });
        
        campaigns[_campaignId].mountainIds.push(mountainId);
        mountainCount++;
        
        emit MountainAdded(mountainId, _name, _altitude, _campaignId);
    }
    
    // ============ NFT MINTING ============
    
    /**
     * @dev Mints an NFT for a completed mountain climb
     * @param _mountainId Mountain climbed
     * @param _proofURI IPFS URI with climb proof (photos, GPS data)
     */
    function mintClimbingNFT(
        uint256 _mountainId,
        string memory _proofURI
    ) external returns (uint256) {
        require(_mountainId < mountainCount, "Mountain does not exist");
        Mountain memory mountain = mountains[_mountainId];
        require(mountain.isActive, "Mountain is not active");
        
        Campaign storage campaign = campaigns[mountain.campaignId];
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp >= campaign.startDate, "Campaign not started");
        require(block.timestamp <= campaign.endDate, "Campaign has ended");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Create NFT metadata
        climbingNFTs[newTokenId] = ClimbingNFT({
            mountainId: _mountainId,
            climber: msg.sender,
            climbDate: block.timestamp,
            mountainName: mountain.name,
            altitude: mountain.altitude,
            verified: false // Requires admin verification
        });
        
        // Mint the NFT
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _proofURI);
        
        // Track participant NFTs
        participantNFTs[msg.sender].push(newTokenId);
        nftCount++;
        
        emit NFTMinted(
            newTokenId,
            msg.sender,
            mountain.campaignId,
            mountain.name,
            mountain.altitude,
            block.timestamp
        );
        
        return newTokenId;
    }
    
    /**
     * @dev Verifies an NFT climb (admin only)
     * @param _tokenId Token ID to verify
     */
    function verifyNFT(uint256 _tokenId) external onlyOwner {
        require(_exists(_tokenId), "Token does not exist");
        require(!climbingNFTs[_tokenId].verified, "NFT already verified");
        require(
            block.timestamp <= climbingNFTs[_tokenId].climbDate + VERIFICATION_PERIOD,
            "Verification period expired"
        );
        
        ClimbingNFT storage nft = climbingNFTs[_tokenId];
        nft.verified = true;
        
        Mountain memory mountain = mountains[nft.mountainId];
        Campaign storage campaign = campaigns[mountain.campaignId];
        
        // Add to campaign participants if first verified NFT
        if (!campaign.hasNFT[nft.climber]) {
            campaign.participants.push(nft.climber);
            campaign.hasNFT[nft.climber] = true;
            campaignParticipants[mountain.campaignId][nft.climber] = true;
        }
        
        campaign.totalNFTsMinted++;
        
        emit NFTVerified(_tokenId, nft.climber);
    }
    
    // ============ SPONSOR & PRIZE POOL MANAGEMENT ============
    
    /**
     * @dev Registers a sponsor and contributes ETH to campaign prize pool
     * @param _campaignId Campaign to sponsor
     * @param _name Sponsor name
     * @param _logoURI Sponsor logo URI
     */
    function sponsorCampaign(
        uint256 _campaignId,
        string memory _name,
        string memory _logoURI
    ) external payable {
        require(_campaignId < campaignCount, "Campaign does not exist");
        require(msg.value > 0, "Must contribute ETH");
        require(campaigns[_campaignId].isActive, "Campaign not active");
        
        // Register sponsor if first time
        if (sponsors[msg.sender].sponsorAddress == address(0)) {
            sponsors[msg.sender] = Sponsor({
                name: _name,
                sponsorAddress: msg.sender,
                totalContributed: msg.value,
                logoURI: _logoURI,
                isActive: true
            });
            emit SponsorRegistered(msg.sender, _name);
        } else {
            sponsors[msg.sender].totalContributed += msg.value;
        }
        
        // Add to campaign prize pool
        campaigns[_campaignId].prizePoolETH += msg.value;
        
        emit PrizePoolFunded(_campaignId, msg.sender, address(0), msg.value);
    }
    
    /**
     * @dev Contributes ERC20 tokens to campaign prize pool
     * @param _campaignId Campaign to sponsor
     * @param _token ERC20 token address
     * @param _amount Token amount to contribute
     */
    function sponsorCampaignERC20(
        uint256 _campaignId,
        address _token,
        uint256 _amount
    ) external {
        require(_campaignId < campaignCount, "Campaign does not exist");
        require(_amount > 0, "Must contribute tokens");
        require(campaigns[_campaignId].isActive, "Campaign not active");
        
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        
        Campaign storage campaign = campaigns[_campaignId];
        
        // Track new ERC20 token if first time
        if (campaign.prizePoolERC20[_token] == 0) {
            campaign.erc20Tokens.push(_token);
        }
        
        campaign.prizePoolERC20[_token] += _amount;
        
        emit PrizePoolFunded(_campaignId, msg.sender, _token, _amount);
    }
    
    // ============ PRIZE DISTRIBUTION ============
    
    /**
     * @dev Distributes prize pool equally among verified NFT holders
     * @param _campaignId Campaign to distribute prizes for
     */
    function distributePrizes(uint256 _campaignId) external onlyOwner nonReentrant {
        require(_campaignId < campaignCount, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        require(!campaign.prizeDistributed, "Prizes already distributed");
        require(block.timestamp > campaign.endDate, "Campaign still active");
        require(campaign.participants.length > 0, "No participants");
        
        uint256 participantCount = campaign.participants.length;
        
        // Distribute ETH prizes
        if (campaign.prizePoolETH > 0) {
            uint256 ethPerParticipant = campaign.prizePoolETH / participantCount;
            
            for (uint256 i = 0; i < participantCount; i++) {
                address participant = campaign.participants[i];
                payable(participant).transfer(ethPerParticipant);
                emit PrizeDistributed(_campaignId, participant, address(0), ethPerParticipant);
            }
        }
        
        // Distribute ERC20 prizes
        for (uint256 t = 0; t < campaign.erc20Tokens.length; t++) {
            address token = campaign.erc20Tokens[t];
            uint256 tokenAmount = campaign.prizePoolERC20[token];
            
            if (tokenAmount > 0) {
                uint256 tokensPerParticipant = tokenAmount / participantCount;
                
                for (uint256 i = 0; i < participantCount; i++) {
                    address participant = campaign.participants[i];
                    IERC20(token).safeTransfer(participant, tokensPerParticipant);
                    emit PrizeDistributed(_campaignId, participant, token, tokensPerParticipant);
                }
            }
        }
        
        campaign.prizeDistributed = true;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Returns campaign information
     */
    function getCampaignInfo(uint256 _campaignId) external view returns (
        string memory name,
        uint256 startDate,
        uint256 endDate,
        uint256 prizePoolETH,
        uint256 participantCount,
        bool isActive,
        bool prizeDistributed
    ) {
        require(_campaignId < campaignCount, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.name,
            campaign.startDate,
            campaign.endDate,
            campaign.prizePoolETH,
            campaign.participants.length,
            campaign.isActive,
            campaign.prizeDistributed
        );
    }
    
    /**
     * @dev Returns NFT metadata
     */
    function getNFTInfo(uint256 _tokenId) external view returns (
        string memory mountainName,
        uint256 altitude,
        uint256 climbDate,
        address climber,
        bool verified
    ) {
        require(_exists(_tokenId), "Token does not exist");
        ClimbingNFT memory nft = climbingNFTs[_tokenId];
        return (
            nft.mountainName,
            nft.altitude,
            nft.climbDate,
            nft.climber,
            nft.verified
        );
    }
    
    /**
     * @dev Returns participant's NFT count for a campaign
     */
    function getParticipantNFTCount(uint256 _campaignId, address _participant) external view returns (uint256) {
        require(_campaignId < campaignCount, "Campaign does not exist");
        return campaignParticipants[_campaignId][_participant] ? 1 : 0;
    }
    
    /**
     * @dev Returns all NFTs owned by an address
     */
    function getParticipantNFTs(address _participant) external view returns (uint256[] memory) {
        return participantNFTs[_participant];
    }
    
    /**
     * @dev Returns campaign's ERC20 prize pool for specific token
     */
    function getCampaignERC20Pool(uint256 _campaignId, address _token) external view returns (uint256) {
        require(_campaignId < campaignCount, "Campaign does not exist");
        return campaigns[_campaignId].prizePoolERC20[_token];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Emergency ERC20 withdrawal (only owner)
     */
    function emergencyWithdrawERC20(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.safeTransfer(owner(), token.balanceOf(address(this)));
    }
    
    /**
     * @dev Close a campaign (only owner)
     */
    function closeCampaign(uint256 _campaignId) external onlyOwner {
        require(_campaignId < campaignCount, "Campaign does not exist");
        campaigns[_campaignId].isActive = false;
    }
    
    // ============ REQUIRED OVERRIDES ============
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}